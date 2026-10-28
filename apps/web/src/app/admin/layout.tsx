import { SkipLink } from '@neo/ui';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LocaleSwitcher, ThemeSwitcher } from '@/components/preferences';
import { SignOutButton } from '@/components/sign-out-button';
import { officeMemberships } from '@/lib/destination';
import { HUE_COOKIE, MODE_COOKIE, parseHue, parseMode } from '@/lib/theme';
import { activeOfficeMembership, getSession } from '@/server/session';
import { AdminMobileMenu, AdminSidebar } from './admin-nav';
import { SIDEBAR_COOKIE } from './sections';

/**
 * Office panel shell. Signed out -> login; several companies and none chosen -> company choice.
 * Side menu on the desktop (collapsible to icons), drawer opened by the logo on the phone.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (officeMemberships(session).length === 0) redirect('/login');
  const active = await activeOfficeMembership();
  if (!active) redirect('/selecionar-empresa');

  const [t, cookieStore] = await Promise.all([getTranslations(), cookies()]);
  const theme = (
    <ThemeSwitcher
      initialHue={parseHue(cookieStore.get(HUE_COOKIE)?.value)}
      initialMode={parseMode(cookieStore.get(MODE_COOKIE)?.value)}
    />
  );

  return (
    <>
      <SkipLink>{t('common.skipToContent')}</SkipLink>
      <div className="flex min-h-screen">
        <AdminSidebar initialCollapsed={cookieStore.get(SIDEBAR_COOKIE)?.value === 'collapsed'} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-(--z-sticky) flex min-h-15 items-center gap-3 border-b border-line bg-[color-mix(in_srgb,var(--surface-1)_86%,transparent)] px-4 py-2 backdrop-blur-md md:px-8">
            <AdminMobileMenu footer={theme} />
            <span className="min-w-0 truncate font-semibold">{active.display_name}</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="max-lg:hidden">{theme}</div>
              <LocaleSwitcher />
              <span className="type-num text-ink-subtle max-sm:hidden">{session.email}</span>
              <SignOutButton />
            </div>
          </header>
          <main
            id="conteudo"
            tabIndex={-1}
            className="mx-auto w-full max-w-[1280px] flex-1 px-8 py-8 outline-none max-md:px-4"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
