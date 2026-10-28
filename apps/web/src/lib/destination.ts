/** Roles that use the office panel (/admin). Employees use the app (/m) with ID + PIN (ADR 0016). */
export const OFFICE_ROLES = ['owner', 'manager', 'coordinator'] as const;
export type OfficeRole = (typeof OFFICE_ROLES)[number];

export interface SessionMembership {
  company_id: string;
  code: string;
  display_name: string;
  status: string;
  role: string;
}

export interface SessionSummary {
  isPlatformAdmin: boolean;
  memberships: SessionMembership[];
}

export function officeMemberships(session: SessionSummary): SessionMembership[] {
  return session.memberships.filter(
    (m) => (OFFICE_ROLES as readonly string[]).includes(m.role) && m.status !== 'canceled',
  );
}

/**
 * Where a signed-in person goes after login:
 * Super Admin -> /super; one company -> /admin; several -> /selecionar-empresa; none -> no access.
 */
export function destinationFor(
  session: SessionSummary,
): { path: string; companyId?: string } | { noAccess: true } {
  if (session.isPlatformAdmin) return { path: '/super' };
  const office = officeMemberships(session);
  const [only] = office;
  if (office.length === 1 && only) return { path: '/admin', companyId: only.company_id };
  if (office.length > 1) return { path: '/selecionar-empresa' };
  return { noAccess: true };
}
