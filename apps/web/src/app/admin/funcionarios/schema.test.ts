import { describe, expect, it } from 'vitest';
import { missingFields } from './schema';

const complete = {
  name_kana: 'ダビラケンジ',
  nationality: 'PE',
  mobile_phone: '09012345678',
  hire_date: '2024-04-01',
  day_wage: 15000,
  loginId: '48217305',
};

describe('missingFields (R05-07: registration status of the employee)', () => {
  it('a complete registration lacks nothing (green)', () => {
    expect(missingFields(complete)).toEqual([]);
  });
  it('lists what is missing (yellow)', () => {
    expect(missingFields({ ...complete, mobile_phone: null, day_wage: 0, loginId: null })).toEqual([
      'mobilePhone',
      'dayWage',
      'appAccess',
    ]);
  });
});
