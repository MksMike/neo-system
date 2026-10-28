// Supabase types, standard results and error mapping (ADR 0020). Clients live in "@neo/db/server".
export type { Database, Json } from './database.types';
export { mapError } from './errors';
export type { DatabaseErrorLike, MappedError } from './errors';
export { ActionError, ERROR_CODES, isErrorCode, RETRYABLE_CODES } from './result';
export type { ActionFailure, ActionResult, ActionSuccess, ErrorCode } from './result';
