import { describe, expect, it } from 'vitest';
import { billingStart, contractChangeSchema, nextBillingStart, suggestedStart } from './schema';

describe('billing dates (R00-14, R00-17)', () => {
  it('the paid period starts after the trial', () => {
    expect(billingStart('2026-11-01', 0)).toBe('2026-11-01');
    expect(billingStart('2026-10-29', 14)).toBe('2026-11-12');
  });

  it('a new paid version keeps the paid cycle of the previous paid one', () => {
    const previous = { type: 'monthly', paid_until: '2026-11-30' };
    expect(nextBillingStart(previous, '2026-11-15')).toBe('2026-12-01');
    expect(nextBillingStart(previous, '2027-01-10')).toBe('2027-01-10');
  });

  it('after a partner contract, or with none, the cycle starts on the change date', () => {
    expect(nextBillingStart({ type: 'partner', paid_until: null }, '2026-12-01')).toBe(
      '2026-12-01',
    );
    expect(nextBillingStart(null, '2026-12-01')).toBe('2026-12-01');
  });
});

describe('suggested start', () => {
  it('is today up to the 28th, else the 1st of next month', () => {
    expect(suggestedStart('2026-10-28')).toBe('2026-10-28');
    expect(suggestedStart('2026-10-29')).toBe('2026-11-01');
    expect(suggestedStart('2026-12-31')).toBe('2027-01-01');
  });
});

describe('contract change schema', () => {
  const base = {
    companyId: '00000000-0000-4000-8000-000000000001',
    expectedContractId: null,
    validFrom: '2026-12-01',
    note: '',
  };

  it('a paid contract needs price and payment method', () => {
    const result = contractChangeSchema.safeParse({ ...base, type: 'monthly' });
    expect(result.error?.issues.map((i) => i.path.join('.'))).toEqual([
      'priceYen',
      'paymentMethod',
    ]);
  });

  it('a partner contract needs neither; an empty note becomes undefined', () => {
    const result = contractChangeSchema.parse({ ...base, type: 'partner' });
    expect(result.note).toBeUndefined();
  });
});
