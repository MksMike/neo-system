import { createAdminClient } from '@neo/db/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { after, NextResponse, type NextRequest } from 'next/server';
import { createHandlers } from '@/server/jobs/handlers';
import { runJobs } from '@/server/jobs/runner';
import { logger } from '@/server/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// The Hostinger cuts requests at 120 s; runJobs stops claiming at 90 s (ADR 0014).
export const maxDuration = 120;

function secretMatches(received: string | null, expected: string): boolean {
  if (!received) return false;
  const a = createHash('sha256').update(received).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * Runs due jobs. Called every 1–5 minutes by the Hostinger cron in production and by
 * `pnpm jobs:run` locally, with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, code: 'unavailable' }, { status: 503 });

  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? null;
  if (!secretMatches(bearer, secret)) {
    logger.log('SEC.CRON.UNAUTHORIZED', {
      route: '/api/jobs/run',
      data: { ip: request.headers.get('x-forwarded-for') ?? 'unknown' },
    });
    after(() => logger.flush());
    return NextResponse.json({ ok: false, code: 'forbidden' }, { status: 401 });
  }

  const admin = createAdminClient();
  const started = performance.now();
  const result = await runJobs({
    logger,
    handlers: createHandlers({
      admin,
      logger,
      appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    }),
    queue: {
      async claim(limit) {
        const { data, error } = await admin.rpc('claim_jobs', {
          p_limit: limit,
          p_lock_seconds: 120,
        });
        if (error) throw error;
        return data;
      },
      async complete(jobId) {
        const { error } = await admin.rpc('complete_job', { p_job_id: jobId });
        if (error) throw error;
      },
      async fail(jobId, message) {
        const { data, error } = await admin.rpc('fail_job', { p_job_id: jobId, p_error: message });
        if (error) throw error;
        return data;
      },
    },
  });

  logger.metric({
    kind: 'request',
    name: '/api/jobs/run',
    durationMs: performance.now() - started,
    error: false,
  });
  after(() => logger.flush());
  return NextResponse.json({ ok: true, data: result });
}

export function GET() {
  return NextResponse.json(
    { ok: false, code: 'not_found' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
