import 'server-only';
import type { Json } from '@neo/db';
import { createAdminClient } from '@neo/db/server';
import { createLogger, type Logger, type Sink } from '@neo/observability';

/** Writes batches to Postgres through public.ingest_observability (service_role only, ADR 0022). */
const databaseSink: Sink = {
  async write(events, metrics) {
    const { error } = await createAdminClient().rpc('ingest_observability', {
      p_events: events.map((e) => ({
        at: e.at,
        code: e.code,
        severity: e.severity,
        request_id: e.requestId,
        route: e.route,
        company_id: e.companyId,
        user_id: e.userId,
        duration_ms: e.durationMs === undefined ? undefined : Math.round(e.durationMs),
        data: e.data,
      })) as Json,
      p_metrics: metrics.map((m) => ({
        at: m.at,
        kind: m.kind,
        name: m.name,
        duration_ms: Math.round(m.durationMs),
        error: m.error,
      })) as Json,
    });
    if (error) throw new Error(`ingest_observability: ${error.message}`);
  },
};

const sampleRate = Number(process.env.LOG_INFO_SAMPLE_RATE ?? '0.1');

/** One logger per server process. Events also go to stdout as JSON lines. */
export const logger: Logger = createLogger({
  sink: process.env.SUPABASE_SECRET_KEY ? databaseSink : undefined,
  infoSampleRate: Number.isFinite(sampleRate) ? sampleRate : 0.1,
});
