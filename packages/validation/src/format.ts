import { AsYouType } from 'libphonenumber-js/min';
import { digitsOnly } from './normalize';

/** Japanese postal code (郵便番号): `1234567` → `123-4567`. Works on partial input while typing. */
export function formatPostalCode(value: string): string {
  const d = digitsOnly(value).slice(0, 7);
  return d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
}

/** Japanese mobile (070/080/090): `09012345678` → `090-1234-5678`. Works on partial input. */
export function formatMobilePhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/** Japanese landline and fax: hyphens follow the area code (`0312345678` → `03-1234-5678`). */
export function formatLandlinePhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d === '') return '';
  return new AsYouType('JP').input(d).replace(/\s+/g, '-');
}

/** Employee login ID (ADR 0016): `48217305` → `4821-7305`. */
export function formatEmployeeLoginId(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

const yenFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

/** Integer yen for display: `1047200` → `￥1,047,200`. */
export function formatYen(value: number): string {
  return yenFormatter.format(value);
}
