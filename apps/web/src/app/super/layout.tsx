import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { TopBar } from '@/components/top-bar';
import { getSession } from '@/server/session';

/**
 * Super Admin area. Anyone who is not Super Admin gets 404, even when signed in, so the
 * area does not reveal that it exists. The database checks again in every function (ADR 0023).
 */
export default async function SuperLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.isPlatformAdmin) notFound();
  return (
    <>
      <TopBar />
      {children}
    </>
  );
}
