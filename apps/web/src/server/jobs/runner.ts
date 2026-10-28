import type { Logger } from '@neo/observability';

export interface JobRow {
  id: string;
  type: string;
  payload: unknown;
  company_id: string | null;
  attempts: number;
  max_attempts: number;
}

export type JobHandler = (job: JobRow) => Promise<void>;

export interface QueueClient {
  claim(limit: number): Promise<JobRow[]>;
  complete(jobId: string): Promise<void>;
  /** Returns the new status: 'pending' (will retry) or 'failed' (gave up). */
  fail(jobId: string, error: string): Promise<string | null>;
}

export interface RunJobsOptions {
  queue: QueueClient;
  handlers: Record<string, JobHandler>;
  logger: Logger;
  /** Stop claiming after this many ms: the Hostinger cuts requests at 120 s (ADR 0013, ADR 0014). */
  budgetMs?: number;
  batchSize?: number;
  now?: () => number;
}

export interface RunJobsResult {
  processed: number;
  failed: number;
  gaveUp: number;
}

/** Claims and runs due jobs in batches until the queue is empty or the time budget ends. */
export async function runJobs(options: RunJobsOptions): Promise<RunJobsResult> {
  const {
    queue,
    handlers,
    logger,
    budgetMs = 90_000,
    batchSize = 10,
    now = () => performance.now(),
  } = options;
  const started = now();
  const result: RunJobsResult = { processed: 0, failed: 0, gaveUp: 0 };

  while (now() - started < budgetMs) {
    const jobs = await queue.claim(batchSize);
    if (jobs.length === 0) break;

    for (const job of jobs) {
      const jobStarted = now();
      const fields = { route: `job:${job.type}`, companyId: job.company_id ?? undefined };
      const handler = handlers[job.type];
      try {
        if (!handler) {
          logger.log('JOB.HANDLER.MISSING', { ...fields, data: { jobId: job.id, type: job.type } });
          throw new Error(`no handler for ${job.type}`);
        }
        await handler(job);
        await queue.complete(job.id);
        result.processed += 1;
        logger.log('JOB.RUN.COMPLETED', {
          ...fields,
          durationMs: now() - jobStarted,
          data: { jobId: job.id },
        });
        logger.metric({
          kind: 'job',
          name: job.type,
          durationMs: now() - jobStarted,
          error: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const status = await queue.fail(job.id, message);
        const gaveUp = status === 'failed';
        result.failed += 1;
        if (gaveUp) result.gaveUp += 1;
        logger.log(gaveUp ? 'JOB.RUN.GAVE_UP' : 'JOB.RUN.FAILED', {
          ...fields,
          durationMs: now() - jobStarted,
          data: { jobId: job.id, attempt: job.attempts, maxAttempts: job.max_attempts, message },
        });
        logger.metric({ kind: 'job', name: job.type, durationMs: now() - jobStarted, error: true });
      }
    }
  }
  return result;
}
