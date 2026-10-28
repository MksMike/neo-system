import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { isLocale, LOCALE_COOKIE, negotiateLocale } from './config';

/** Locale from the cookie, else from Accept-Language, else Japanese. No locale prefix in URLs. */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : negotiateLocale((await headers()).get('accept-language'));
  const messages = (await import(`./messages/${locale}.json`)) as {
    default: Record<string, unknown>;
  };
  return { locale, messages: messages.default, timeZone: 'Asia/Tokyo' };
});
