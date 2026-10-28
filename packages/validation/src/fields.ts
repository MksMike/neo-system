import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { z } from 'zod';
import { digitsOnly, normalizeText } from './normalize';

/**
 * One schema per field type (ADR 0019), shared by forms, Server Actions and jobs.
 * Each schema normalizes its input and outputs the value as stored in the database.
 * Error messages are i18n keys (`validation.*`), translated by the app.
 */

export function freeText(options: { max: number; min?: number }) {
  return z
    .string()
    .transform((v) => normalizeText(v))
    .pipe(
      z
        .string()
        .min(options.min ?? 0, 'validation.required')
        .max(options.max, 'validation.tooLong'),
    );
}

export function longText(options: { max: number; min?: number }) {
  return z
    .string()
    .transform((v) => normalizeText(v, { multiline: true }))
    .pipe(
      z
        .string()
        .min(options.min ?? 0, 'validation.required')
        .max(options.max, 'validation.tooLong'),
    );
}

export const email = z
  .string()
  .transform((v) => normalizeText(v).toLowerCase())
  .pipe(z.email('validation.email').max(254, 'validation.tooLong'));

/** 郵便番号: stored as 7 digits. */
export const postalCode = z
  .string()
  .transform(digitsOnly)
  .pipe(z.string().regex(/^\d{7}$/, 'validation.postalCode'));

/** Mobile 070/080/090: stored as 11 digits. */
export const mobilePhone = z
  .string()
  .transform(digitsOnly)
  .pipe(z.string().regex(/^0[789]0\d{8}$/, 'validation.mobilePhone'));

/** Landline, fax or any valid Japanese number: stored as digits. */
export const landlinePhone = z
  .string()
  .transform(digitsOnly)
  .pipe(
    z
      .string()
      .refine(
        (d) => /^0\d{9,10}$/.test(d) && (parsePhoneNumberFromString(d, 'JP')?.isValid() ?? false),
        'validation.phone',
      ),
  );

/** Bytes of a string in UTF-8, without platform APIs (works in the browser, Node and the edge). */
function utf8Length(value: string): number {
  return encodeURIComponent(value).replace(/%[0-9A-F]{2}/g, 'x').length;
}

/** New password (Supabase Auth, ADR 0024): at least 10 characters; bcrypt reads at most 72 bytes. */
export const newPassword = z
  .string()
  .min(10, 'validation.passwordTooShort')
  .refine((v) => utf8Length(v) <= 72, 'validation.tooLong');

/** Password typed at login: only presence and a sane limit; the rules belong to Supabase Auth. */
export const loginPassword = z
  .string()
  .min(1, 'validation.required')
  .max(200, 'validation.tooLong');

/** Final money values are integer yen (CLAUDE.md, rule 2). */
export const yen = z
  .number()
  .int('validation.integer')
  .min(0, 'validation.min')
  .max(Number.MAX_SAFE_INTEGER, 'validation.max');

/** Employee login ID (ADR 0016): 8 digits. */
export const employeeLoginId = z
  .string()
  .transform(digitsOnly)
  .pipe(z.string().regex(/^\d{8}$/, 'validation.employeeLoginId'));

/** True for PINs that are easy to guess: all equal, or a straight sequence. */
export function isTrivialPin(pin: string): boolean {
  if (/^(\d)\1+$/.test(pin)) return true;
  const steps = Array.from(
    { length: pin.length - 1 },
    (_, i) => pin.charCodeAt(i + 1) - pin.charCodeAt(i),
  );
  return steps.every((s) => s === 1) || steps.every((s) => s === -1);
}

/** PIN chosen by the employee: 4 digits, not trivial. */
export const pin = z
  .string()
  .transform(digitsOnly)
  .pipe(
    z
      .string()
      .regex(/^\d{4}$/, 'validation.pin')
      .refine((p) => !isTrivialPin(p), 'validation.pinTrivial'),
  );

/** Optional field: empty (after normalization) becomes `undefined`, anything else must pass `schema`. */
export function optional<T extends z.ZodType<unknown, string>>(schema: T) {
  return z
    .string()
    .transform((v) => normalizeText(v))
    .pipe(z.union([z.literal('').transform(() => undefined), schema]));
}

/** Business date (CLAUDE.md, rule 7): `YYYY-MM-DD`, a real calendar day. */
export const businessDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.date')
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
  }, 'validation.date');

/** Adds days to a business date, in calendar days (no time zone involved). */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Today in Asia/Tokyo as `YYYY-MM-DD` (business dates, CLAUDE.md rule 7). */
export function todayInTokyo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(now);
}
