import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { MODE_COOKIE, parseMode } from '@/lib/theme';
import { LocaleSwitcher, ThemeSwitcher } from './preferences';

/** Top bar with brand, theme and language (design system page header). */
export async function TopBar() {
  const [t, cookieStore] = await Promise.all([getTranslations('common'), cookies()]);
  return (
    <header className="sticky top-0 z-(--z-sticky) flex min-h-15 flex-wrap items-center gap-3 border-b border-line bg-[color-mix(in_srgb,var(--surface-1)_86%,transparent)] px-5 py-2 backdrop-blur-md">
      <Link href="/" className="flex min-w-0 items-center gap-2.5 text-ink no-underline">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-grad-brand text-[13px] font-bold tracking-[.02em] text-on-grad shadow-[0_0_0_4px_var(--glow)]">
          NX
        </span>
        <span className="min-w-0">
          <span className="block font-bold tracking-[.02em]">{t('appName')}</span>
          <span className="block text-xs leading-[14px] text-ink-subtle max-sm:hidden">
            {t('tagline')}
          </span>
        </span>
      </Link>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <ThemeSwitcher initialMode={parseMode(cookieStore.get(MODE_COOKIE)?.value)} />
        <LocaleSwitcher />
      </div>
    </header>
  );
}
