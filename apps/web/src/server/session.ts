import 'server-only';
import { createUserClient, type Db } from '@neo/db/server';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { officeMemberships, type SessionMembership, type SessionSummary } from '@/lib/destination';

/** Company chosen in /selecionar-empresa. Always validated against the memberships, never trusted. */
export const COMPANY_COOKIE = 'neo-company';

export interface Session extends SessionSummary {
  userId: string;
  email: string;
}

export async function userClient(): Promise<Db> {
  return createUserClient(await cookies());
}

/** The signed-in person and where they can go, or null. Cached per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await userClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc('my_session');
  if (error) throw error;
  const summary = data as unknown as {
    is_platform_admin: boolean;
    memberships: SessionMembership[];
  };
  return {
    userId: user.id,
    email: user.email ?? '',
    isPlatformAdmin: summary.is_platform_admin,
    memberships: summary.memberships,
  };
});

export async function setActiveCompany(companyId: string): Promise<void> {
  (await cookies()).set(COMPANY_COOKIE, companyId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function activeCompanyId(): Promise<string | undefined> {
  return (await cookies()).get(COMPANY_COOKIE)?.value;
}

/**
 * Company of the office panel: the one chosen in /selecionar-empresa, or the only one.
 * Null when there is none to show (the layout sends the person to the login or the choice).
 */
export const activeOfficeMembership = cache(async (): Promise<SessionMembership | null> => {
  const session = await getSession();
  if (!session) return null;
  const office = officeMemberships(session);
  const chosen = await activeCompanyId();
  return (
    office.find((m) => m.company_id === chosen) ??
    (office.length === 1 ? (office[0] ?? null) : null)
  );
});
