'use client';

import {
  Button,
  cn,
  NativeSelect,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  toast,
} from '@neo/ui';
import { Languages, LogOut, Moon, Sun, User, UserCog } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore, useTransition } from 'react';
import { signOut } from '@/app/(auth)/actions';
import { saveMyLocale } from '@/i18n/actions';
import { isLocale, LOCALES } from '@/i18n/config';
import { HUE_COOKIE, HUES, MODE_COOKIE, type Hue, type Mode } from '@/lib/theme';
import { useAction } from '@/lib/use-action';

const SWATCHES: Record<Hue, string> = {
  azul: 'linear-gradient(135deg, #1E3A8A, #3A63CF)',
  grafite: 'linear-gradient(135deg, #202024, #4D4D56)',
  roxo: 'linear-gradient(135deg, #4A1F8C, #7C4DD6)',
};

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Whether the device is in dark mode, kept in sync (no effect, no hydration mismatch). */
function useSystemDark(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(DARK_QUERY);
      query.addEventListener('change', onChange);
      return () => {
        query.removeEventListener('change', onChange);
      };
    },
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

function saveThemeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

/** The person's photo; until photos exist, a person icon (design system, avatar). */
function Avatar({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full border-2 border-surface-1 bg-primary-soft text-primary-text',
        size === 'lg' ? 'size-10' : 'size-9',
      )}
    >
      <User aria-hidden className="size-5" strokeWidth={1.75} />
    </span>
  );
}

/**
 * Account menu: the avatar opens a panel with "manage account", the theme (light/dark toggle and
 * the three hues), the preferred language (saved in the profile, so every login opens in it)
 * and, after a safety gap, the logout.
 */
export function AccountMenu({
  name,
  email,
  initialHue,
  initialMode,
  manageHref,
}: {
  name: string;
  email: string;
  initialHue: Hue;
  initialMode: Mode;
  manageHref?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(initialHue);
  // null = "system": follows the device until the person picks light or dark here.
  const [chosenDark, setChosenDark] = useState<boolean | null>(
    initialMode === 'sistema' ? null : initialMode === 'escuro',
  );
  const systemDark = useSystemDark();
  const dark = chosenDark ?? systemDark;
  const [savingLocale, startLocale] = useTransition();
  const logout = useAction(signOut, { idempotent: true });

  function chooseMode(nextDark: boolean) {
    const mode: Mode = nextDark ? 'escuro' : 'claro';
    setChosenDark(nextDark);
    document.documentElement.setAttribute('data-mode', mode);
    saveThemeCookie(MODE_COOKIE, mode);
  }

  function chooseHue(next: Hue) {
    setHue(next);
    document.documentElement.setAttribute('data-hue', next);
    saveThemeCookie(HUE_COOKIE, next);
  }

  function chooseLocale(next: string) {
    if (!isLocale(next) || next === locale) return;
    startLocale(async () => {
      const result = await saveMyLocale({ locale: next });
      if (result.ok) router.refresh();
      else toast.error(t(result.message));
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('account.open', { name })}
          className="cursor-pointer rounded-full border-0 bg-transparent p-0 transition-shadow duration-(--dur-fast) hover:shadow-[0_0_0_4px_var(--glow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Avatar />
        </button>
      </PopoverTrigger>
      <PopoverContent aria-label={t('account.label')} className="flex flex-col gap-1">
        <div className="flex items-center gap-3 px-2 pt-1 pb-2">
          <Avatar size="lg" />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{name}</span>
            <span className="type-num block truncate text-xs text-ink-subtle">{email}</span>
          </span>
        </div>

        {manageHref ? (
          <Button asChild variant="ghost" className="justify-start">
            <Link
              href={manageHref}
              onClick={() => {
                setOpen(false);
              }}
            >
              <UserCog aria-hidden />
              {t('account.manage')}
            </Link>
          </Button>
        ) : null}

        <div className="mx-1 my-1 h-px bg-line" />

        <div className="flex items-center justify-between gap-3 px-2 py-1.5">
          <span className="flex items-center gap-2 text-ink-subtle">
            <Sun aria-hidden className="size-4" strokeWidth={1.75} />
            <Switch
              checked={dark}
              onCheckedChange={chooseMode}
              aria-label={t('account.darkMode')}
            />
            <Moon aria-hidden className="size-4" strokeWidth={1.75} />
          </span>
          <span role="radiogroup" aria-label={t('preferences.theme')} className="flex gap-2">
            {HUES.map((h) => (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={hue === h}
                aria-label={t(`preferences.hues.${h}`)}
                title={t(`preferences.hues.${h}`)}
                onClick={() => {
                  chooseHue(h);
                }}
                style={{ background: SWATCHES[h] }}
                className="size-6 cursor-pointer rounded-full border-2 border-surface-1 p-0 shadow-[0_0_0_1px_var(--line)] transition-shadow duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-checked:shadow-[0_0_0_2px_var(--focus)]"
              />
            ))}
          </span>
        </div>

        <label className="flex items-center gap-2 px-2 py-1.5">
          <Languages aria-hidden className="size-4 shrink-0 text-ink-subtle" strokeWidth={1.75} />
          <span className="sr-only">{t('preferences.language')}</span>
          <NativeSelect
            value={locale}
            disabled={savingLocale}
            onChange={(e) => {
              chooseLocale(e.target.value);
            }}
            wrapperClassName="flex-1"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t(`preferences.languages.${l}`)}
              </option>
            ))}
          </NativeSelect>
        </label>

        {/* Safety gap: the logout is never right under the other controls */}
        <div className="mx-1 mt-3 mb-1 h-px bg-line" />

        <Button
          variant="ghost"
          className="justify-start text-danger hover:text-danger"
          loading={logout.pending}
          onClick={() => {
            void logout.run({}).then((result) => {
              if (result.ok) {
                router.replace(result.data.redirectTo);
                router.refresh();
              }
            });
          }}
        >
          <LogOut aria-hidden />
          {t('auth.signOut')}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
