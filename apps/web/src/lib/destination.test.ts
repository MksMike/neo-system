import { describe, expect, it } from 'vitest';
import { destinationFor, officeMemberships, type SessionMembership } from './destination';

const m = (role: string, status = 'active', id = role): SessionMembership => ({
  company_id: id,
  code: id.toUpperCase(),
  display_name: id,
  status,
  role,
});

describe('destination after login (ADR 0016, ADR 0024)', () => {
  it('sends the Super Admin to /super, even with memberships', () => {
    expect(destinationFor({ isPlatformAdmin: true, memberships: [m('owner')] })).toEqual({
      path: '/super',
    });
  });

  it('sends a person with one office company straight to /admin with that company', () => {
    expect(
      destinationFor({ isPlatformAdmin: false, memberships: [m('manager', 'active', 'c1')] }),
    ).toEqual({
      path: '/admin',
      companyId: 'c1',
    });
  });

  it('asks which company when there are several', () => {
    expect(
      destinationFor({
        isPlatformAdmin: false,
        memberships: [m('owner', 'active', 'a'), m('coordinator', 'active', 'b')],
      }),
    ).toEqual({ path: '/selecionar-empresa' });
  });

  it('gives no access to employees (they use the app with ID + PIN) or canceled companies', () => {
    expect(destinationFor({ isPlatformAdmin: false, memberships: [m('employee')] })).toEqual({
      noAccess: true,
    });
    expect(
      destinationFor({ isPlatformAdmin: false, memberships: [m('owner', 'canceled')] }),
    ).toEqual({
      noAccess: true,
    });
    expect(destinationFor({ isPlatformAdmin: false, memberships: [] })).toEqual({ noAccess: true });
  });

  it('keeps blocked and read-only companies reachable: the panel explains the status', () => {
    expect(
      officeMemberships({ isPlatformAdmin: false, memberships: [m('owner', 'blocked')] }),
    ).toHaveLength(1);
  });
});
