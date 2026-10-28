import { ActionError, isErrorCode, type ErrorCode } from './result';

/** Shape of errors from supabase-js / PostgREST and from Postgres itself. */
export interface DatabaseErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

export interface MappedError {
  code: ErrorCode;
  /** Stable detail code (e.g. `company_code_taken`) when the database gave one. */
  detail?: string;
  /** True when the database refused by permission (RLS or privilege): logged as SEC.RLS.DENIED. */
  permissionDenied: boolean;
}

const DETAIL_CODE = /^[a-z][a-z0-9_]*(:.*)?$/;

/**
 * Translates any error into a standard code (ADR 0020).
 * Our SQL functions raise P0001 with the code as message and a detail code (see app.raise).
 */
export function mapError(error: unknown): MappedError {
  if (error instanceof ActionError) {
    return { code: error.code, detail: error.detail, permissionDenied: false };
  }

  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return { code: 'timeout', permissionDenied: false };
  }
  // fetch() failing to reach the database (connection refused, DNS, reset)
  if (error instanceof TypeError && /fetch|network|ECONN|socket/i.test(error.message)) {
    return { code: 'unavailable', permissionDenied: false };
  }

  const e = (typeof error === 'object' && error !== null ? error : {}) as DatabaseErrorLike;
  const detail = e.details && DETAIL_CODE.test(e.details) ? e.details.split(':')[0] : undefined;

  switch (e.code) {
    case 'P0001':
      if (e.message && isErrorCode(e.message)) {
        return { code: e.message, detail, permissionDenied: e.message === 'forbidden' };
      }
      return { code: 'internal', permissionDenied: false };
    case '23505': // unique_violation
      return { code: 'conflict', detail: 'duplicate', permissionDenied: false };
    case '23503': // foreign_key_violation
      return { code: 'conflict', detail: 'referenced', permissionDenied: false };
    case '23514': // check_violation
    case '23502': // not_null_violation
    case '22P02': // invalid_text_representation
    case '22007': // invalid_datetime_format
    case '22008': // datetime_field_overflow
    case '22003': // numeric_value_out_of_range
      return { code: 'validation', permissionDenied: false };
    case '42501': // insufficient_privilege (RLS or grants)
      return { code: 'forbidden', permissionDenied: true };
    case '40001': // serialization_failure
    case '40P01': // deadlock_detected
      return { code: 'conflict', detail: 'concurrent_update', permissionDenied: false };
    case '57014': // query_canceled (statement timeout)
      return { code: 'timeout', permissionDenied: false };
    case 'PGRST116': // no rows for .single()
      return { code: 'not_found', permissionDenied: false };
    case 'PGRST301': // JWT expired or invalid
    case 'PGRST302':
      return { code: 'forbidden', permissionDenied: false };
    default:
      return { code: 'internal', permissionDenied: false };
  }
}
