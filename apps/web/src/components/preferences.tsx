'use client';

import { SegmentedControl, toast } from '@neo/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { setLocale } from '@/i18n/actions';
import { isLocale, LOCALES } from '@/i18n/config';
import { MODE_COOKIE, MODES, parseMode, type Mode } from '@/lib/theme';

function saveThemeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

/** Light/dark mode (MK-UI identity has one palette, ADR 0026). Applies at once on <html> and saves cookies for the next server render. */
export function ThemeSwitcher({ initialMode }: { initialMode: Mode }) {
  const t = useTranslations('preferences');
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        label={t('mode')}
        value={mode}
        options={MODES.map((m) => ({ value: m, label: t(`modes.${m}`) }))}
        onValueChange={(v) => {
          const next = parseMode(v);
          setMode(next);
          document.documentElement.dataset.mode = next;
          saveThemeCookie(MODE_COOKIE, next);
        }}
      />
    </div>
  );
}

/** Interface language (ja/pt), saved by a Server Action. */
export function LocaleSwitcher() {
  const t = useTranslations('preferences');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <SegmentedControl
      label={t('language')}
      value={locale}
      options={LOCALES.map((l) => ({ value: l, label: t(`languages.${l}`) }))}
      onValueChange={(v) => {
        if (pending || !isLocale(v)) return;
        startTransition(async () => {
          const result = await setLocale({ locale: v });
          if (result.ok) router.refresh();
          else toast.error(t('language'));
        });
      }}
    />
  );
}
