import { SkipLink } from '@neo/ui';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AccountMenu } from '@/components/account-menu';
import { officeMemberships } from '@/lib/destination';
import { HUE_COOKIE, MODE_COOKIE, parseHue, parseMode } from '@/lib/theme';
import { activeOfficeMembership, getSession } from '@/server/session';
import { AdminMobileMenu, AdminSidebar } from './admin-nav';
import { SIDEBAR_COOKIE } from './sections';

/**
 * Office panel shell. Signed out -> login; several companies and none chosen -> company choice.
 * Side menu on the desktop (collapsible to icons), drawer opened by the company symbol on the
 * phone; theme, language and logout live in the account menu (avatar, top right).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (officeMemberships(session).length === 0) redirect('/login');
  const active = await activeOfficeMembership();
  if (!active) redirect('/selecionar-empresa');

  const [t, cookieStore] = await Promise.all([getTranslations(), cookies()]);

  return (
    <>
      <SkipLink>{t('common.skipToContent')}</SkipLink>
      <div className="flex min-h-screen">
        <AdminSidebar
          company={active.display_name}
          initialCollapsed={cookieStore.get(SIDEBAR_COOKIE)?.value === 'collapsed'}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-15 items-center gap-3 px-4 pt-3 md:px-8">
            <AdminMobileMenu company={active.display_name} />
            <span className="min-w-0 truncate font-semibold md:hidden">{active.display_name}</span>
            <div className="ml-auto">
              <AccountMenu
                name={session.displayName ?? session.email.split('@')[0] ?? session.email}
                email={session.email}
                initialHue={parseHue(cookieStore.get(HUE_COOKIE)?.value)}
                initialMode={parseMode(cookieStore.get(MODE_COOKIE)?.value)}
                manageHref="/admin/conta"
              />
            </div>
          </header>
          <main
            id="conteudo"
            tabIndex={-1}
            className="mx-auto w-full max-w-[1440px] flex-1 px-8 pt-2 pb-8 outline-none max-md:px-4"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
