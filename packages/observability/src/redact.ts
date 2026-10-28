/**
 * Removes secrets and personal data from event data before it is logged (ADR 0022):
 * PIN, password, token, cookie, my number, bank account, residence card, e-mail, phone, names.
 * Only ids, codes and numbers should remain.
 */

export const REDACTED = '[redacted]';

const EXACT_KEYS = new Set([
  'pin',
  'name',
  'fullname',
  'displayname',
  'legalname',
  'legalnamekana',
  'address',
  'postalcode',
  'birthdate',
  'dateofbirth',
]);

const KEY_PATTERNS = [
  'password',
  'passwd',
  'secret',
  'token',
  'cookie',
  'authorization',
  'apikey',
  'mynumber',
  'kojinbango',
  'bankaccount',
  'accountnumber',
  'residencecard',
  'zairyu',
  'email',
  'phone',
  'mobile',
];

const EMAIL_VALUE = /[^@\s]+@[^@\s]+\.[^@\s]+/;
const JWT_VALUE = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/;
const MAX_STRING = 500;
const MAX_DEPTH = 5;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z]/g, '');
}

export function isSensitiveKey(key: string): boolean {
  const k = normalizeKey(key);
  return EXACT_KEYS.has(k) || KEY_PATTERNS.some((p) => k.includes(p));
}

function redactValue(value: unknown, depth: number): unknown {
  if (typeof value === 'string') {
    if (EMAIL_VALUE.test(value) || JWT_VALUE.test(value)) return REDACTED;
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  }
  if (value === null || typeof value !== 'object') return value;
  if (depth >= MAX_DEPTH) return '[depth]';
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redactValue(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] = isSensitiveKey(key) ? REDACTED : redactValue(v, depth + 1);
  }
  return out;
}

export function redact(data: Record<string, unknown>): Record<string, unknown> {
  return redactValue(data, 0) as Record<string, unknown>;
}
