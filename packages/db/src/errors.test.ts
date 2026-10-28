import { describe, expect, it } from 'vitest';
import { ActionError, mapError } from './index';

describe('mapError (ADR 0020)', () => {
  it('keeps the code and detail raised by our SQL functions', () => {
    expect(mapError({ code: 'P0001', message: 'conflict', details: 'company_code_taken' })).toEqual(
      {
        code: 'conflict',
        detail: 'company_code_taken',
        permissionDenied: false,
      },
    );
    expect(
      mapError({
        code: 'P0001',
        message: 'conflict',
        details: 'module_has_dependents: employees <- scheduling',
      }),
    ).toEqual({ code: 'conflict', detail: 'module_has_dependents', permissionDenied: false });
  });

  it('marks forbidden from our functions and privilege errors as permission denied', () => {
    expect(
      mapError({ code: 'P0001', message: 'forbidden', details: 'super_admin_with_2fa_required' }),
    ).toMatchObject({
      code: 'forbidden',
      permissionDenied: true,
    });
    expect(mapError({ code: '42501', message: 'permission denied for table company' })).toEqual({
      code: 'forbidden',
      permissionDenied: true,
    });
  });

  it('maps Postgres constraint errors', () => {
    expect(mapError({ code: '23505' }).code).toBe('conflict');
    expect(mapError({ code: '23514' }).code).toBe('validation');
    expect(mapError({ code: '22P02' }).code).toBe('validation');
    expect(mapError({ code: '40001' })).toMatchObject({
      code: 'conflict',
      detail: 'concurrent_update',
    });
    expect(mapError({ code: '57014' }).code).toBe('timeout');
    expect(mapError({ code: 'PGRST116' }).code).toBe('not_found');
  });

  it('never leaks unknown messages: unknown errors are internal, without detail', () => {
    expect(mapError({ code: 'P0001', message: 'something odd', details: 'secret stack' })).toEqual({
      code: 'internal',
      permissionDenied: false,
    });
    expect(mapError({ code: 'XX000', message: 'boom', details: 'Has Spaces And Caps' })).toEqual({
      code: 'internal',
      permissionDenied: false,
    });
    expect(mapError('a string').code).toBe('internal');
  });

  it('maps network failures and timeouts', () => {
    expect(mapError(new TypeError('fetch failed')).code).toBe('unavailable');
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    expect(mapError(abort).code).toBe('timeout');
  });

  it('passes ActionError through', () => {
    expect(mapError(new ActionError('company_read_only', 'status_blocked'))).toEqual({
      code: 'company_read_only',
      detail: 'status_blocked',
      permissionDenied: false,
    });
  });
});
