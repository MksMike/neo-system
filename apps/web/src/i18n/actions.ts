'use server';

import { cookies } from 'next/headers';
import { isLocale, LOCALE_COOKIE } from './config';

/** Saves the interface language (ADR 0020 response shape). */
export async function setLocale(
  locale: string,
): Promise<{ ok: true } | { ok: false; code: 'validation' }> {
  if (!isLocale(locale)) return { ok: false, code: 'validation' };
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return { ok: true };
}
