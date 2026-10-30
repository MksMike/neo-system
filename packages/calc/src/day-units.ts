/**
 * Units of a worked day (定日) used as the quantity of the 請求書 and of the 勤怠表 totals.
 * 半日 = 0.5 (4 h); por hora = hours ÷ 8; every other period of a worked day = 1.
 * Returned in hundredths (1 day = 100) so sums stay exact integers.
 */
export function dayUnitsHundredths(
  status: 'pending' | 'work' | 'off',
  period: 'teiji' | 'hannichi' | 'zangyo' | 'hayade' | 'yakin' | 'hourly',
  workedMinutes: number,
): number {
  if (status !== 'work') return 0;
  if (period === 'hannichi') return 50;
  if (period === 'hourly') return Math.round((workedMinutes * 100) / 480);
  return 100;
}
