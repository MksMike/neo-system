import { EVENT_CATALOG, SEVERITY_RANK, type EventCode, type Severity } from './catalog';
import { redact } from './redact';

export interface LogEvent {
  at: string;
  code: EventCode;
  severity: Severity;
  requestId?: string;
  route?: string;
  companyId?: string;
  userId?: string;
  durationMs?: number;
  data: Record<string, unknown>;
}

export interface MetricPoint {
  at: string;
  kind: 'request' | 'job';
  name: string;
  durationMs: number;
  error: boolean;
}

/** Where stored events go (the database in production; a fake in tests). */
export interface Sink {
  write(events: LogEvent[], metrics: MetricPoint[]): Promise<void>;
}

export interface LogFields {
  requestId?: string;
  route?: string;
  companyId?: string;
  userId?: string;
  durationMs?: number;
  /** Overrides the catalog severity (rare: e.g. a known error that is critical in one place). */
  severity?: Severity;
  data?: Record<string, unknown>;
}

export interface LoggerOptions {
  sink?: Sink;
  /** Share of `info` events stored (0–1). `warn` and above are always stored; `debug` never. */
  infoSampleRate?: number;
  random?: () => number;
  now?: () => Date;
  output?: Pick<Console, 'log' | 'error'>;
}

export interface Logger {
  log(code: EventCode, fields?: LogFields): LogEvent;
  metric(point: Omit<MetricPoint, 'at'>): void;
  /** Sends the buffered events and metrics to the sink. Never throws. */
  flush(): Promise<void>;
}

export function shouldStore(severity: Severity, sampleRate: number, roll: number): boolean {
  if (SEVERITY_RANK[severity] >= SEVERITY_RANK.warn) return true;
  if (severity === 'info') return roll < sampleRate;
  return false;
}

/** Structured logger (ADR 0022): one JSON line per event on stdout, plus batches to the sink. */
export function createLogger(options: LoggerOptions = {}): Logger {
  const {
    sink,
    infoSampleRate = 0.1,
    random = Math.random,
    now = () => new Date(),
    output = console,
  } = options;
  let events: LogEvent[] = [];
  let metrics: MetricPoint[] = [];

  return {
    log(code, fields = {}) {
      const event: LogEvent = {
        at: now().toISOString(),
        code,
        severity: fields.severity ?? EVENT_CATALOG[code].severity,
        requestId: fields.requestId,
        route: fields.route,
        companyId: fields.companyId,
        userId: fields.userId,
        durationMs: fields.durationMs,
        data: redact(fields.data ?? {}),
      };
      if (event.severity !== 'debug') {
        const line = JSON.stringify(event);
        if (SEVERITY_RANK[event.severity] >= SEVERITY_RANK.error) output.error(line);
        else output.log(line);
      }
      if (sink && shouldStore(event.severity, infoSampleRate, random())) events.push(event);
      return event;
    },

    metric(point) {
      if (sink) metrics.push({ ...point, at: now().toISOString() });
    },

    async flush() {
      if (!sink || (events.length === 0 && metrics.length === 0)) return;
      const batchEvents = events;
      const batchMetrics = metrics;
      events = [];
      metrics = [];
      try {
        await sink.write(batchEvents, batchMetrics);
      } catch (error) {
        // Logging must never break the request; the line on stdout is still there.
        output.error(
          JSON.stringify({
            at: now().toISOString(),
            code: 'APP.UNHANDLED.ERROR',
            severity: 'critical',
            data: {
              where: 'logger.flush',
              message: error instanceof Error ? error.message : String(error),
            },
          }),
        );
      }
    },
  };
}
