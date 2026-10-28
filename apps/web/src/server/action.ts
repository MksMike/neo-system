import { mapError, type ActionFailure, type ActionResult, type ErrorCode } from '@neo/db';
import type { EventCode, Logger } from '@neo/observability';
import type { z, ZodType } from 'zod';

/** A request slower than this is logged as PERF.REQUEST.SLOW (ADR 0022). */
export const SLOW_MS = 3000;

export interface ActionContext {
  requestId: string;
  log: (code: EventCode, data?: Record<string, unknown>) => void;
}

export interface ActionConfig<S extends ZodType, O> {
  /** Stable name, used in logs and metrics (e.g. `company.provision`). */
  name: string;
  /** Shared schema from @neo/validation: the server always validates again (ADR 0019). */
  schema: S;
  handler: (input: z.output<S>, ctx: ActionContext) => Promise<O>;
}

export interface ActionDeps {
  logger: Logger;
  /** Runs work after the response (Next.js `after`); tests run it at once. */
  schedule: (task: () => Promise<void>) => void;
  now?: () => number;
  newId?: () => string;
}

function failure(
  code: ErrorCode,
  requestId: string,
  extra: Partial<ActionFailure> = {},
): ActionFailure {
  return { ok: false, code, message: `errors.${code}`, requestId, ...extra };
}

/** Validation messages are i18n keys (`validation.*`); anything else becomes `validation.invalid`. */
function toFieldErrors(issues: z.core.$ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.map(String).join('.') || '_';
    out[path] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
  }
  return out;
}

/**
 * Builds Server Actions with the standard behavior (ADR 0020 and ADR 0022):
 * validate with the shared schema, run, answer `{ ok, data }` or `{ ok: false, code, message }`,
 * log with a catalog code, record the metric and never leak technical details.
 */
export function createActionFactory(deps: ActionDeps) {
  const now = deps.now ?? (() => performance.now());
  const newId = deps.newId ?? (() => crypto.randomUUID());

  return function defineAction<S extends ZodType, O>(config: ActionConfig<S, O>) {
    return async function action(rawInput: z.input<S>): Promise<ActionResult<O>> {
      const requestId = newId();
      const started = now();
      const route = `action:${config.name}`;
      const ctx: ActionContext = {
        requestId,
        log: (code, data) => deps.logger.log(code, { requestId, route, data }),
      };

      let result: ActionResult<O>;
      const parsed = config.schema.safeParse(rawInput);
      if (!parsed.success) {
        const fieldErrors = toFieldErrors(parsed.error.issues);
        deps.logger.log('SEC.INPUT.REJECTED', {
          requestId,
          route,
          data: { fields: Object.keys(fieldErrors) },
        });
        result = failure('validation', requestId, { fieldErrors });
      } else {
        try {
          result = { ok: true, data: await config.handler(parsed.data, ctx), requestId };
        } catch (error) {
          const mapped = mapError(error);
          if (mapped.code === 'internal') {
            deps.logger.log('APP.UNHANDLED.ERROR', {
              requestId,
              route,
              data: { message: error instanceof Error ? error.message : String(error) },
            });
          } else if (mapped.permissionDenied) {
            deps.logger.log('SEC.RLS.DENIED', {
              requestId,
              route,
              data: { detail: mapped.detail },
            });
          } else {
            deps.logger.log('APP.ACTION.FAILED', {
              requestId,
              route,
              data: { code: mapped.code, detail: mapped.detail },
            });
          }
          result = failure(mapped.code, requestId, mapped.detail ? { detail: mapped.detail } : {});
        }
      }

      const durationMs = now() - started;
      if (result.ok) deps.logger.log('APP.ACTION.COMPLETED', { requestId, route, durationMs });
      if (durationMs > SLOW_MS)
        deps.logger.log('PERF.REQUEST.SLOW', { requestId, route, durationMs });
      deps.logger.metric({
        kind: 'request',
        name: route,
        durationMs,
        error: !result.ok && result.code === 'internal',
      });
      deps.schedule(() => deps.logger.flush());
      return result;
    };
  };
}
