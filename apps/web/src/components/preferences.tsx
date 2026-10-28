'use client';

import { SegmentedControl, toast } from '@neo/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { setLocale } from '@/i18n/actions';
import { LOCALES } from '@/i18n/config';
import {
  HUE_COOKIE,
  HUES,
  MODE_COOKIE,
  MODES,
  parseHue,
  parseMode,
  type Hue,
  type Mode,
} from '@/lib/theme';

const SWATCHES: Record<Hue, string> = {
  azul: 'linear-gradient(135deg, #1E3A8A, #3A63CF)',
  grafite: 'linear-gradient(135deg, #202024, #4D4D56)',
  roxo: 'linear-gradient(135deg, #4A1F8C, #7C4DD6)',
};

function saveThemeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

/** Theme hue × mode. Applies at once on <html> and saves cookies for the next server render. */
export function ThemeSwitcher({ initialHue, initialMode }: { initialHue: Hue; initialMode: Mode }) {
  const t = useTranslations('preferences');
  const [hue, setHue] = useState(initialHue);
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        label={t('theme')}
        value={hue}
        options={HUES.map((h) => ({ value: h, label: t(`hues.${h}`), swatch: SWATCHES[h] }))}
        onValueChange={(v) => {
          const next = parseHue(v);
          setHue(next);
          document.documentElement.dataset.hue = next;
          saveThemeCookie(HUE_COOKIE, next);
        }}
      />
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
        if (pending) return;
        startTransition(async () => {
          const result = await setLocale(v);
          if (result.ok) router.refresh();
          else toast.error(t('language'));
        });
      }}
    />
  );
}
