import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { TopBar } from '@/components/top-bar';
import { officeMemberships } from '@/lib/destination';
import { activeCompanyId, getSession } from '@/server/session';

/** Office panel. Signed out -> login; several companies and none chosen -> company choice. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const office = officeMemberships(session);
  if (office.length === 0) redirect('/login');

  const chosen = await activeCompanyId();
  const active =
    office.find((m) => m.company_id === chosen) ?? (office.length === 1 ? office[0] : undefined);
  if (!active) redirect('/selecionar-empresa');

  return (
    <>
      <TopBar />
      {children}
    </>
  );
}
