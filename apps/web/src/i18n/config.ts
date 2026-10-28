/** Admin languages in phase 1 (CLAUDE.md): ja and pt. The employee app adds es and en. */
export const LOCALES = ['ja', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ja';
export const LOCALE_COOKIE = 'neo-locale';

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.some((l) => l === value);
}

/** Picks the first supported language from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const preferred = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', q] = part.trim().split(';q=');
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return preferred.map((p) => p.lang).find(isLocale) ?? DEFAULT_LOCALE;
}
