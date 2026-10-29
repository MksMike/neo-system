import { createHmac, randomInt } from 'node:crypto';
import { isTrivialPin } from '@neo/validation';

/**
 * Employee login by 8-digit ID + 4-digit PIN (ADR 0016). Pure functions: the secret (PIN_PEPPER)
 * is passed in by server code and never reaches the browser.
 */

/** Domain of the technical e-mails. `.invalid` never resolves: these addresses receive nothing. */
export const PIN_EMAIL_DOMAIN = 'pin.neo-system.invalid';

/** A random 8-digit ID (never starts with 0, so it always shows as 8 digits). */
export function generateLoginId(random: (min: number, max: number) => number = randomInt): string {
  return String(random(10_000_000, 100_000_000));
}

/** A random 4-digit PIN that is not trivial (repeated digits or a straight sequence). */
export function generatePin(random: (min: number, max: number) => number = randomInt): string {
  for (;;) {
    const pin = String(random(0, 10_000)).padStart(4, '0');
    if (!isTrivialPin(pin)) return pin;
  }
}

/** The technical e-mail of the login in Supabase Auth (item 5 of ADR 0016). */
export function technicalEmail(loginId: string): string {
  return `${loginId}@${PIN_EMAIL_DOMAIN}`;
}

/**
 * The Supabase password: HMAC-SHA256 of ID and PIN with the server secret. The PIN alone does not
 * open the login when talking to Supabase directly (item 5 of ADR 0016).
 */
export function derivePassword(loginId: string, pin: string, pepper: string): string {
  if (pepper.length < 32) throw new Error('PIN_PEPPER must have at least 32 characters');
  return createHmac('sha256', pepper).update(`${loginId}:${pin}`).digest('base64url');
}
