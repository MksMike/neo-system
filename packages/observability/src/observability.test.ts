import { describe, expect, it, vi } from 'vitest';
import {
  createLogger,
  EVENT_CATALOG,
  redact,
  REDACTED,
  shouldStore,
  type LogEvent,
  type MetricPoint,
} from './index';

describe('event catalog (ADR 0022)', () => {
  it('every code follows AREA.CATEGORY.EVENT, the same rule the database checks', () => {
    for (const code of Object.keys(EVENT_CATALOG)) {
      expect(code).toMatch(/^[A-Z]+\.[A-Z_]+\.[A-Z_]+$/);
    }
  });

  it('every entry has a description', () => {
    for (const entry of Object.values(EVENT_CATALOG))
      expect(entry.description.length).toBeGreaterThan(5);
  });
});

describe('redact (no secrets or personal data in logs)', () => {
  it('removes secrets and personal fields by key, at any depth', () => {
    const out = redact({
      pin: '1357',
      password: 'x',
      accessToken: 'abc',
      Authorization: 'Bearer x',
      my_number: '123456789012',
      bank_account: '1234567',
      owner: { email: 'a@b.jp', display_name: 'Mike', phone: '09012345678' },
      company_id: '00000000-0000-0000-0000-000000000001',
      module: 'employees',
    });
    expect(out).toEqual({
      pin: REDACTED,
      password: REDACTED,
      accessToken: REDACTED,
      Authorization: REDACTED,
      my_number: REDACTED,
      bank_account: REDACTED,
      owner: { email: REDACTED, display_name: REDACTED, phone: REDACTED },
      company_id: '00000000-0000-0000-0000-000000000001',
      module: 'employees',
    });
  });

  it('removes e-mails and JWTs found in values under harmless keys', () => {
    expect(redact({ note: 'contato: mike@example.com', t: 'eyJhbGciOiJ.eyJzdWIi.sig' })).toEqual({
      note: REDACTED,
      t: REDACTED,
    });
  });

  it('truncates long strings and limits depth', () => {
    const out = redact({ big: 'x'.repeat(600), a: { b: { c: { d: { e: { f: 1 } } } } } });
    expect((out.big as string).length).toBe(501);
    expect(JSON.stringify(out)).toContain('[depth]');
  });
});

describe('logger', () => {
  function setup(sampleRate = 0.1, roll = 0.5) {
    const written: { events: LogEvent[]; metrics: MetricPoint[] }[] = [];
    const output = { log: vi.fn(), error: vi.fn() };
    const logger = createLogger({
      sink: {
        write: (events, metrics) => {
          written.push({ events, metrics });
          return Promise.resolve();
        },
      },
      infoSampleRate: sampleRate,
      random: () => roll,
      now: () => new Date('2026-11-03T00:00:00Z'),
      output,
    });
    return { logger, written, output };
  }

  it('stores warn and above always, info by sampling, debug never', () => {
    expect(shouldStore('critical', 0, 0.99)).toBe(true);
    expect(shouldStore('warn', 0, 0.99)).toBe(true);
    expect(shouldStore('info', 0.1, 0.05)).toBe(true);
    expect(shouldStore('info', 0.1, 0.5)).toBe(false);
    expect(shouldStore('debug', 1, 0)).toBe(false);
  });

  it('uses the catalog severity and redacts data', async () => {
    const { logger, written, output } = setup();
    const event = logger.log('AUTH.LOGIN.FAILED', {
      requestId: 'r1',
      data: { pin: '1357', loginId: '48217305' },
    });
    expect(event.severity).toBe('warn');
    expect(event.data).toEqual({ pin: REDACTED, loginId: '48217305' });
    expect(output.log).toHaveBeenCalledOnce();
    await logger.flush();
    expect(written[0]?.events[0]?.code).toBe('AUTH.LOGIN.FAILED');
  });

  it('writes errors to stderr and batches metrics', async () => {
    const { logger, written, output } = setup();
    logger.log('APP.UNHANDLED.ERROR', { data: { message: 'boom' } });
    logger.log('APP.REQUEST.COMPLETED');
    logger.metric({ kind: 'request', name: '/super', durationMs: 40, error: false });
    await logger.flush();
    expect(output.error).toHaveBeenCalledOnce();
    expect(written[0]?.events.map((e) => e.code)).toEqual(['APP.UNHANDLED.ERROR']);
    expect(written[0]?.metrics).toEqual([
      {
        kind: 'request',
        name: '/super',
        durationMs: 40,
        error: false,
        at: '2026-11-03T00:00:00.000Z',
      },
    ]);
  });

  it('never throws when the sink fails', async () => {
    const output = { log: vi.fn(), error: vi.fn() };
    const logger = createLogger({
      sink: { write: () => Promise.reject(new Error('db down')) },
      output,
    });
    logger.log('JOB.RUN.FAILED');
    await expect(logger.flush()).resolves.toBeUndefined();
    expect(output.error).toHaveBeenLastCalledWith(expect.stringContaining('db down'));
  });
});
