import { ActionError } from '@neo/db';
import type { Db } from '@neo/db/server';
import { createLogger, type LogEvent } from '@neo/observability';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { runAction } from '../lib/run-action';
import { createActionFactory } from './action';
import { sendOwnerInvitation } from './jobs/handlers';
import { runJobs, type JobRow, type QueueClient } from './jobs/runner';

function testLogger() {
  const events: LogEvent[] = [];
  const logger = createLogger({
    sink: {
      write: (e) => {
        events.push(...e);
        return Promise.resolve();
      },
    },
    infoSampleRate: 1,
    output: { log: () => undefined, error: () => undefined },
  });
  return { logger, events };
}

describe('defineAction (ADR 0020, ADR 0022)', () => {
  function setup(clock: number[] = [0, 10]) {
    const { logger, events } = testLogger();
    const times = [...clock];
    const defineAction = createActionFactory({
      logger,
      schedule: (task) => void task(),
      now: () => times.shift() ?? 0,
      newId: () => 'req-1',
    });
    return { defineAction, events };
  }

  const schema = z.object({ name: z.string().min(1, 'validation.required') });

  it('returns ok with data and the request id', async () => {
    const { defineAction, events } = setup();
    const action = defineAction({
      name: 'test.ok',
      schema,
      handler: (input) => Promise.resolve(input.name.length),
    });
    await expect(action({ name: 'abc' })).resolves.toEqual({
      ok: true,
      data: 3,
      requestId: 'req-1',
    });
    expect(events.map((e) => e.code)).toEqual(['APP.ACTION.COMPLETED']);
  });

  it('validates again on the server and returns field errors as i18n keys', async () => {
    const { defineAction, events } = setup();
    const handler = vi.fn();
    const action = defineAction({ name: 'test.validation', schema, handler });
    const result = await action({ name: '' });
    expect(result).toEqual({
      ok: false,
      code: 'validation',
      message: 'errors.validation',
      requestId: 'req-1',
      fieldErrors: { name: 'validation.required' },
    });
    expect(handler).not.toHaveBeenCalled();
    expect(events[0]?.code).toBe('SEC.INPUT.REJECTED');
  });

  it('maps known errors without leaking details', async () => {
    const { defineAction, events } = setup();
    const action = defineAction({
      name: 'test.conflict',
      schema,
      handler: () =>
        Promise.reject(
          Object.assign(new Error('x'), {
            code: 'P0001',
            message: 'conflict',
            details: 'company_code_taken',
          }),
        ),
    });
    await expect(action({ name: 'a' })).resolves.toMatchObject({
      ok: false,
      code: 'conflict',
      message: 'errors.conflict',
      detail: 'company_code_taken',
    });
    expect(events[0]?.code).toBe('APP.ACTION.FAILED');
  });

  it('logs permission refusals as SEC.RLS.DENIED and crashes as APP.UNHANDLED.ERROR', async () => {
    const { defineAction, events } = setup([0, 1, 0, 1]);
    const denied = defineAction({
      name: 'test.denied',
      schema,
      handler: () => Promise.reject(new ActionError('forbidden')),
    });
    const crash = defineAction({
      name: 'test.crash',
      schema,
      handler: () => Promise.reject(new Error('db password is x')),
    });
    expect((await denied({ name: 'a' })).ok).toBe(false);
    const crashed = await crash({ name: 'a' });
    expect(crashed).toEqual({
      ok: false,
      code: 'internal',
      message: 'errors.internal',
      requestId: 'req-1',
    });
    expect(events.map((e) => e.code)).toEqual(['APP.ACTION.FAILED', 'APP.UNHANDLED.ERROR']);
  });

  it('flags slow actions', async () => {
    const { defineAction, events } = setup([0, 3500]);
    const action = defineAction({ name: 'test.slow', schema, handler: () => Promise.resolve(1) });
    await action({ name: 'a' });
    expect(events.map((e) => e.code)).toEqual(['APP.ACTION.COMPLETED', 'PERF.REQUEST.SLOW']);
  });
});

describe('runAction (client side, ADR 0020)', () => {
  const unavailable = {
    ok: false as const,
    code: 'unavailable' as const,
    message: 'errors.unavailable',
    requestId: 'r',
  };
  const conflict = {
    ok: false as const,
    code: 'conflict' as const,
    message: 'errors.conflict',
    requestId: 'r',
  };
  const sleep = () => Promise.resolve();

  it('retries idempotent operations on unavailable, then succeeds', async () => {
    const call = vi
      .fn()
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce({ ok: true, data: 1, requestId: 'r' });
    await expect(runAction(call, { idempotent: true, sleep })).resolves.toMatchObject({ ok: true });
    expect(call).toHaveBeenCalledTimes(3);
  });

  it('never retries non-idempotent operations', async () => {
    const call = vi.fn().mockResolvedValue(unavailable);
    await runAction(call, { sleep });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('does not retry errors that are not transient', async () => {
    const call = vi.fn().mockResolvedValue(conflict);
    await expect(runAction(call, { idempotent: true, sleep })).resolves.toEqual(conflict);
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('gives up waiting after the timeout', async () => {
    const call = () => new Promise<never>(() => undefined);
    await expect(runAction(call, { timeoutMs: 5 })).resolves.toMatchObject({
      ok: false,
      code: 'timeout',
    });
  });

  it('turns a network failure into unavailable instead of throwing', async () => {
    await expect(
      runAction(() => Promise.reject(new TypeError('fetch failed'))),
    ).resolves.toMatchObject({
      code: 'unavailable',
    });
  });
});

describe('runJobs (ADR 0014)', () => {
  const job = (id: string, type: string): JobRow => ({
    id,
    type,
    payload: {},
    company_id: null,
    attempts: 1,
    max_attempts: 5,
  });

  function fakeQueue(batches: JobRow[][], failStatus = 'pending') {
    const done: string[] = [];
    const failed: string[] = [];
    const queue: QueueClient = {
      claim: () => Promise.resolve(batches.shift() ?? []),
      complete: (id) => {
        done.push(id);
        return Promise.resolve();
      },
      fail: (id) => {
        failed.push(id);
        return Promise.resolve(failStatus);
      },
    };
    return { queue, done, failed };
  }

  it('runs batches until the queue is empty, completing and failing jobs', async () => {
    const { logger, events } = testLogger();
    const { queue, done, failed } = fakeQueue([
      [job('1', 'test.ok'), job('2', 'test.boom')],
      [job('3', 'test.ok')],
    ]);
    const result = await runJobs({
      queue,
      logger,
      handlers: {
        'test.ok': () => Promise.resolve(),
        'test.boom': () => Promise.reject(new Error('boom')),
      },
    });
    await logger.flush();
    expect(result).toEqual({ processed: 2, failed: 1, gaveUp: 0 });
    expect(done).toEqual(['1', '3']);
    expect(failed).toEqual(['2']);
    expect(events.map((e) => e.code)).toEqual([
      'JOB.RUN.COMPLETED',
      'JOB.RUN.FAILED',
      'JOB.RUN.COMPLETED',
    ]);
  });

  it('logs a missing handler and a final failure as critical', async () => {
    const { logger, events } = testLogger();
    const { queue } = fakeQueue([[job('1', 'test.unknown')]], 'failed');
    const result = await runJobs({ queue, logger, handlers: {} });
    await logger.flush();
    expect(result.gaveUp).toBe(1);
    expect(events.map((e) => [e.code, e.severity])).toEqual([
      ['JOB.HANDLER.MISSING', 'critical'],
      ['JOB.RUN.GAVE_UP', 'critical'],
    ]);
  });

  it('stops claiming when the time budget ends', async () => {
    const { logger } = testLogger();
    const { queue } = fakeQueue([[job('1', 'test.ok')], [job('2', 'test.ok')]]);
    const times = [0, 0, 0, 0, 100];
    const result = await runJobs({
      queue,
      logger,
      handlers: { 'test.ok': () => Promise.resolve() },
      budgetMs: 50,
      now: () => times.shift() ?? 100,
    });
    expect(result.processed).toBe(1);
  });
});

describe('sendOwnerInvitation (CLAUDE.md rule 1: service_role filters company_id)', () => {
  const companyId = '11111111-1111-4111-8111-111111111111';
  const invitationId = '22222222-2222-4222-8222-222222222222';

  function fakeAdmin(status = 'pending', inviteError: { code: string } | null = null) {
    const filters: [string, string, unknown][] = [];
    const updates: unknown[] = [];
    const invited: string[] = [];
    const builder = (table: string) => {
      const b = {
        select: () => b,
        update: (values: unknown) => {
          updates.push(values);
          return b;
        },
        eq: (column: string, value: unknown) => {
          filters.push([table, column, value]);
          return b;
        },
        single: () =>
          Promise.resolve({
            data: {
              id: invitationId,
              company_id: companyId,
              email: 'owner@demo.jp',
              name: 'Owner',
              status,
            },
            error: null,
          }),
        then: (resolve: (v: { error: null }) => void) => {
          resolve({ error: null });
        },
      };
      return b;
    };
    const admin = {
      from: builder,
      auth: {
        admin: {
          inviteUserByEmail: (email: string) => {
            invited.push(email);
            return Promise.resolve({ error: inviteError });
          },
        },
      },
    } as unknown as Db;
    return { admin, filters, updates, invited };
  }

  const job: JobRow = {
    id: 'j1',
    type: 'owner_invitation.send',
    payload: { invitation_id: invitationId },
    company_id: companyId,
    attempts: 1,
    max_attempts: 5,
  };

  it('invites by e-mail and marks the invitation sent, filtering company_id on every query', async () => {
    const { logger } = testLogger();
    const { admin, filters, updates, invited } = fakeAdmin();
    await sendOwnerInvitation({ admin, logger, appUrl: 'http://localhost:3000' })(job);
    expect(invited).toEqual(['owner@demo.jp']);
    expect(updates).toEqual([expect.objectContaining({ status: 'sent' })]);
    const companyFilters = filters.filter(([, column]) => column === 'company_id');
    expect(companyFilters).toEqual([
      ['owner_invitation', 'company_id', companyId],
      ['owner_invitation', 'company_id', companyId],
    ]);
  });

  it('is idempotent: an invitation already sent is skipped', async () => {
    const { logger } = testLogger();
    const { admin, invited, updates } = fakeAdmin('sent');
    await sendOwnerInvitation({ admin, logger, appUrl: 'x' })(job);
    expect(invited).toEqual([]);
    expect(updates).toEqual([]);
  });

  it('refuses a job without company', async () => {
    const { logger } = testLogger();
    const { admin } = fakeAdmin();
    await expect(
      sendOwnerInvitation({ admin, logger, appUrl: 'x' })({ ...job, company_id: null }),
    ).rejects.toThrow('job_without_company');
  });

  it('an existing login is not an error: the invitation is still marked sent', async () => {
    const { logger, events } = testLogger();
    const { admin, updates } = fakeAdmin('pending', { code: 'email_exists' });
    await sendOwnerInvitation({ admin, logger, appUrl: 'x' })(job);
    await logger.flush();
    expect(updates).toHaveLength(1);
    expect(events.map((e) => e.code)).toEqual(['AUTH.INVITE.EXISTING_USER']);
  });
});
