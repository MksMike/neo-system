/**
 * Consumption tax of an integer yen amount, rounded down (切り捨て), as the current invoices do.
 * Pending confirmation with the accountant: rounding once per rate per invoice (適格請求書).
 */
export function taxOf(amount: number, ratePercent: number): number {
  if (!Number.isSafeInteger(amount) || !Number.isInteger(ratePercent)) {
    throw new RangeError('amount and rate must be integers');
  }
  // Integer arithmetic: exact for amounts up to Number.MAX_SAFE_INTEGER / 100.
  return Math.floor((amount * ratePercent) / 100);
}

/**
 * Price without tax and tax of a daily price. A price that already includes the tax (税込) is
 * split back: tax = price × rate / (100 + rate), rounded down.
 */
export function splitPrice(
  price: number,
  ratePercent: number,
  includesTax: boolean,
): { net: number; tax: number; total: number } {
  if (!includesTax) {
    const tax = taxOf(price, ratePercent);
    return { net: price, tax, total: price + tax };
  }
  const tax = Math.floor((price * ratePercent) / (100 + ratePercent));
  return { net: price - tax, tax, total: price };
}
