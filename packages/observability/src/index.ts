// Structured logger, event code catalog (AREA.CATEGORY.EVENT) and removal of forbidden fields (ADR 0022).
export { EVENT_CATALOG, SEVERITY_RANK } from './catalog';
export type { CatalogEntry, EventCode, Severity } from './catalog';
export { createLogger, shouldStore } from './logger';
export type { LogEvent, LogFields, Logger, LoggerOptions, MetricPoint, Sink } from './logger';
export { isSensitiveKey, redact, REDACTED } from './redact';
