import { describe, expect, it } from 'vitest';
import { dayUnitsHundredths } from './day-units';

describe('dayUnitsHundredths', () => {
  it('定時 is one day', () => {
    expect(dayUnitsHundredths('work', 'teiji', 480)).toBe(100);
  });
  it('残業 is still one day (the overtime is counted apart)', () => {
    expect(dayUnitsHundredths('work', 'zangyo', 480)).toBe(100);
  });
  it('半日 is half a day', () => {
    expect(dayUnitsHundredths('work', 'hannichi', 240)).toBe(50);
  });
  it('por hora: 3 h is 0.38 day (3 ÷ 8 = 0.375, rounded)', () => {
    expect(dayUnitsHundredths('work', 'hourly', 180)).toBe(38);
  });
  it('folga and not registered count nothing', () => {
    expect(dayUnitsHundredths('off', 'teiji', 480)).toBe(0);
    expect(dayUnitsHundredths('pending', 'teiji', 480)).toBe(0);
  });
  it('golden: 杉田 24 days + ビジャマリン 2 days = 26.00 定日 (聖工業, October 2026)', () => {
    const days = Array.from({ length: 24 + 2 }, () => 'teiji' as const);
    expect(days.reduce((sum, p) => sum + dayUnitsHundredths('work', p, 480), 0)).toBe(2600);
  });
});
