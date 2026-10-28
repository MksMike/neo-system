import 'server-only';
import { createAdminClient } from '@neo/db/server';
import { logger } from '../logger';
import { createHandlers } from './handlers';
import { runJobs, type RunJobsResult } from './runner';

/**
 * Runs the due jobs of the queue once (ADR 0014). Used by /api/jobs/run (cron) and right after
 * an action that queued an external effect, so the e-mail goes out at once; the cron stays as
 * the safety net with retries. Safe to run concurrently: jobs are claimed with SKIP LOCKED.
 */
export async function processQueue(): Promise<RunJobsResult> {
  const admin = createAdminClient();
  return runJobs({
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
}
