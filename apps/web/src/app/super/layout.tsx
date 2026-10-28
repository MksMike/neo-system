import { Sidebar, SidebarBrand, SkipLink } from '@neo/ui';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { LocaleSwitcher, ThemeSwitcher } from '@/components/preferences';
import { SignOutButton } from '@/components/sign-out-button';
import { HUE_COOKIE, MODE_COOKIE, parseHue, parseMode } from '@/lib/theme';
import { getSession } from '@/server/session';
import { MobileMenu } from './mobile-menu';
import { SuperNav } from './super-nav';

/**
 * Super Admin shell (SA-07). Anyone who is not Super Admin gets 404, even when signed in, so
 * the area does not reveal that it exists. The database checks again in every function (ADR 0023).
 */
export default async function SuperLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.isPlatformAdmin) notFound();

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
        <Sidebar
          aria-label={t('super.nav.label')}
          className="sticky top-0 h-screen overflow-y-auto max-md:hidden"
        >
          <SidebarBrand mark="NEO" title="NEO-SYSTEM" subtitle={t('super.title')} />
          <SuperNav />
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-(--z-sticky) flex min-h-15 items-center gap-2 border-b border-line bg-[color-mix(in_srgb,var(--surface-1)_86%,transparent)] px-4 py-2 backdrop-blur-md md:px-8">
            <MobileMenu footer={theme} />
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
            className="mx-auto w-full max-w-[1180px] flex-1 px-8 py-8 outline-none max-md:px-4"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
