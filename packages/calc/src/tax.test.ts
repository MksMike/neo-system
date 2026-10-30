import { describe, expect, it } from 'vitest';
import { splitPrice, taxOf } from './tax';

describe('taxOf (golden: invoices of the Bubble MVP)', () => {
  it('20,000 at 10% is 2,000', () => {
    expect(taxOf(20_000, 10)).toBe(2_000);
  });
  it('rounds down: 1,091,984 at 10% is 109,198 (熊澤工業, October 2026)', () => {
    expect(taxOf(1_091_984, 10)).toBe(109_198);
  });
  it('468,000 at 10% is 46,800 (聖工業, October 2026)', () => {
    expect(taxOf(468_000, 10)).toBe(46_800);
  });
  it('0% is no tax', () => {
    expect(taxOf(20_000, 0)).toBe(0);
  });
  it('refuses fractions', () => {
    expect(() => taxOf(10.5, 10)).toThrow(RangeError);
  });
});

describe('splitPrice', () => {
  it('税抜: adds the tax', () => {
    expect(splitPrice(20_000, 10, false)).toEqual({ net: 20_000, tax: 2_000, total: 22_000 });
  });
  it('税込: takes the tax out of the price', () => {
    expect(splitPrice(22_000, 10, true)).toEqual({ net: 20_000, tax: 2_000, total: 22_000 });
  });
  it('税込 with a remainder rounds the tax down', () => {
    expect(splitPrice(3_000, 10, true)).toEqual({ net: 2_728, tax: 272, total: 3_000 });
  });
});
