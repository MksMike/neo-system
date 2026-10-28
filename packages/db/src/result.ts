/**
 * Standard response of every Server Action and route (ADR 0020).
 * `message` is an i18n key (`errors.<code>`); the screen translates it.
 */
export const ERROR_CODES = [
  'validation',
  'conflict',
  'not_found',
  'forbidden',
  'company_read_only',
  'module_disabled',
  'rate_limited',
  'timeout',
  'unavailable',
  'internal',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ActionSuccess<T> {
  ok: true;
  data: T;
  requestId: string;
}

export interface ActionFailure {
  ok: false;
  code: ErrorCode;
  /** i18n key, e.g. `errors.conflict`. Never technical details. */
  message: string;
  requestId: string;
  /** Stable detail code from the database (e.g. `company_code_taken`), safe to show or translate. */
  detail?: string;
  /** Field path -> i18n key of the validation message. */
  fieldErrors?: Record<string, string>;
}

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

/** Codes that are safe to retry automatically, for idempotent operations only (ADR 0020). */
export const RETRYABLE_CODES: readonly ErrorCode[] = ['timeout', 'unavailable'];

export function isErrorCode(value: string): value is ErrorCode {
  return (ERROR_CODES as readonly string[]).includes(value);
}

/** Error with a standard code, thrown by server code and turned into an ActionFailure. */
export class ActionError extends Error {
  readonly code: ErrorCode;
  readonly detail?: string;

  constructor(code: ErrorCode, detail?: string) {
    super(detail ?? code);
    this.name = 'ActionError';
    this.code = code;
    this.detail = detail;
  }
}
