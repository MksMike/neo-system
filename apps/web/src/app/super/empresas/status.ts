import type { BadgeProps } from '@neo/ui';

export const COMPANY_STATUSES = [
  'trial',
  'active',
  'past_due',
  'read_only',
  'blocked',
  'canceled',
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

/** Status color, always shown with its text (R02-03). */
export const STATUS_BADGE: Record<CompanyStatus, BadgeProps['variant']> = {
  trial: 'info',
  active: 'success',
  past_due: 'warning',
  read_only: 'warning',
  blocked: 'danger',
  canceled: 'neutral',
};

/** A business date (`YYYY-MM-DD`) as a Date at UTC midnight; format it with `timeZone: 'UTC'`. */
export function businessDateValue(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}
