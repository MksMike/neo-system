import { createHash, timingSafeEqual } from 'node:crypto';
import { after, NextResponse, type NextRequest } from 'next/server';
import { processQueue } from '@/server/jobs/process';
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

  const started = performance.now();
  const result = await processQueue();

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
