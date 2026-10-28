// Control characters (C0, DEL, C1) and invisible format characters (zero-width
// spaces, joiners, BOM, bidi overrides). Line feed is handled separately.
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g;
const INVISIBLE = new RegExp('[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]', 'g');

/**
 * Normalizes user input before validation (ADR 0019):
 * NFKC turns full-width characters into their normal form (`０９０` → `090`),
 * invisible and control characters are removed, and the ends are trimmed.
 */
export function normalizeText(value: string, options: { multiline?: boolean } = {}): string {
  let text = value
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE, '')
    .replace(CONTROL, '');
  if (!options.multiline) text = text.replace(/\n/g, ' ');
  return text.trim();
}

/** Keeps only ASCII digits, after NFKC (so full-width digits count). */
export function digitsOnly(value: string): string {
  return value.normalize('NFKC').replace(/\D/g, '');
}
