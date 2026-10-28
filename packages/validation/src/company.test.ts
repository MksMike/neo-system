import { describe, expect, it } from 'vitest';
import {
  addDays,
  businessDate,
  companyCode,
  invoiceRegNo,
  kanaText,
  optional,
  postalCode,
  romanizeKana,
  suggestCompanyCode,
  todayInTokyo,
  toKatakana,
} from './index';

describe('companyCode (R00-01)', () => {
  it('accepts 3 to 12 capital letters and digits, uppercasing and NFKC', () => {
    expect(companyCode.parse(' sugita ')).toBe('SUGITA');
    expect(companyCode.parse('ＤＥＭＯ１')).toBe('DEMO1');
  });

  it('refuses short, long and symbols', () => {
    for (const bad of ['AB', 'ABCDEFGHIJKLM', 'SUGI-TA', 'すぎた']) {
      expect(companyCode.safeParse(bad).error?.issues[0]?.message).toBe('validation.companyCode');
    }
  });
});

describe('invoiceRegNo', () => {
  it('stores T + 13 digits, adding the T when only digits are typed', () => {
    expect(invoiceRegNo.parse('t1234567890123')).toBe('T1234567890123');
    expect(invoiceRegNo.parse('１２３４－５６７８９０１２３')).toBe('T1234567890123');
  });

  it('refuses other lengths', () => {
    expect(invoiceRegNo.safeParse('T123').success).toBe(false);
  });
});

describe('kanaText', () => {
  it('turns hiragana into katakana', () => {
    expect(toKatakana('すぎたこうぎょう')).toBe('スギタコウギョウ');
    expect(kanaText({ max: 50 }).parse('かぶしきがいしゃ すぎた')).toBe('カブシキガイシャ スギタ');
  });

  it('refuses kanji', () => {
    expect(kanaText({ max: 50 }).safeParse('杉田').error?.issues[0]?.message).toBe(
      'validation.kana',
    );
  });
});

describe('suggestCompanyCode', () => {
  it('romanizes kana, with digraphs and small tsu', () => {
    expect(romanizeKana('スギタ')).toBe('SUGITA');
    expect(romanizeKana('トウキョウ')).toBe('TOUKYOU');
    expect(romanizeKana('ハッチュウ')).toBe('HATCHUU');
    expect(romanizeKana('ニッポン')).toBe('NIPPON');
  });

  it('uses the Latin name without the legal form', () => {
    expect(suggestCompanyCode({ legalName: 'Demo Construction Co., Ltd.' })).toBe('DEMO');
    expect(suggestCompanyCode({ legalName: '株式会社ABC建設' })).toBe('ABC');
  });

  it('falls back to the kana name without the legal form', () => {
    expect(
      suggestCompanyCode({
        legalName: '株式会社杉田工業',
        kana: 'カブシキガイシャ スギタコウギョウ',
      }),
    ).toBe('SUGITAKOUGYO');
    expect(suggestCompanyCode({ legalName: '杉田', kana: 'スギタ コウギョウ' })).toBe('SUGITA');
  });

  it('is empty when nothing fits', () => {
    expect(suggestCompanyCode({ legalName: '杉田工業' })).toBe('');
  });
});

describe('optional, businessDate and dates', () => {
  it('turns empty into undefined and validates the rest', () => {
    const schema = optional(postalCode);
    expect(schema.parse('  ')).toBeUndefined();
    expect(schema.parse('123-4567')).toBe('1234567');
    expect(schema.safeParse('12').success).toBe(false);
  });

  it('accepts only real calendar days', () => {
    expect(businessDate.safeParse('2026-02-28').success).toBe(true);
    expect(businessDate.safeParse('2026-02-30').success).toBe(false);
    expect(businessDate.safeParse('2026/02/01').success).toBe(false);
  });

  it('adds days and knows today in Tokyo', () => {
    expect(addDays('2026-10-25', 14)).toBe('2026-11-08');
    expect(todayInTokyo(new Date('2026-10-28T15:30:00Z'))).toBe('2026-10-29');
  });
});
