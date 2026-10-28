import { RETRYABLE_CODES, type ActionFailure, type ActionResult } from '@neo/db';

export interface RunActionOptions {
  /** Only idempotent operations are retried automatically (ADR 0020). */
  idempotent?: boolean;
  /** Extra attempts after the first one, for idempotent operations. */
  retries?: number;
  /** The screen stops waiting long before the 120 s cut of the Hostinger. */
  timeoutMs?: number;
  /** Base wait between attempts, doubled each time. */
  backoffMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const clientFailure = (code: 'timeout' | 'unavailable'): ActionFailure => ({
  ok: false,
  code,
  message: `errors.${code}`,
  requestId: 'client',
});

class Timeout extends Error {}

/**
 * Calls a Server Action with a timeout and, for idempotent operations, retries on
 * `timeout` and `unavailable` (503 from the host, network down). Never throws.
 */
export async function runAction<T>(
  call: () => Promise<ActionResult<T>>,
  options: RunActionOptions = {},
): Promise<ActionResult<T>> {
  const {
    idempotent = false,
    retries = 3,
    timeoutMs = 30_000,
    backoffMs = 500,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options;
  const maxAttempts = idempotent ? retries + 1 : 1;
  let last: ActionResult<T> = clientFailure('unavailable');

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      last = await Promise.race([
        call(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(new Timeout());
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      last = clientFailure(error instanceof Timeout ? 'timeout' : 'unavailable');
    } finally {
      clearTimeout(timer);
    }

    if (last.ok || !RETRYABLE_CODES.includes(last.code)) return last;
    if (attempt < maxAttempts - 1) await sleep(backoffMs * 2 ** attempt);
  }
  return last;
}
