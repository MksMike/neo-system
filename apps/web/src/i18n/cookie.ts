import 'server-only';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE, type Locale } from './config';

/** The language the server renders in (read by i18n/request.ts). */
export async function writeLocaleCookie(locale: Locale): Promise<void> {
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}
