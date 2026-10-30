import { Toaster, TooltipProvider } from '@neo/ui';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { IBM_Plex_Mono, Noto_Sans_JP } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { HUE_COOKIE, MODE_COOKIE, parseHue, parseMode } from '@/lib/theme';
import './globals.css';

// Identidade MK-UI (ADR 0026): Noto Sans JP cobre kanji, hiragana e katakana com o mesmo desenho.
const notoSans = Noto_Sans_JP({
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: { default: t('appName'), template: `%s · ${t('appName')}` },
    description: t('tagline'),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [locale, cookieStore] = await Promise.all([getLocale(), cookies()]);
  const hue = parseHue(cookieStore.get(HUE_COOKIE)?.value);
  const mode = parseMode(cookieStore.get(MODE_COOKIE)?.value);

  return (
    <html
      lang={locale}
      data-hue={hue}
      data-mode={mode}
      className={`${notoSans.variable} ${plexMono.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
