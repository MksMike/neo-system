import { describe, expect, it } from 'vitest';
import {
  email,
  employeeLoginId,
  formatEmployeeLoginId,
  formatLandlinePhone,
  formatMobilePhone,
  formatPostalCode,
  formatYen,
  freeText,
  isTrivialPin,
  landlinePhone,
  loginPassword,
  longText,
  mobilePhone,
  newPassword,
  normalizeText,
  pin,
  postalCode,
  yen,
} from './index';

describe('normalizeText (ADR 0019)', () => {
  it('converts full-width characters with NFKC', () => {
    expect(normalizeText('０９０－１２３４　ＡＢＣ')).toBe('090-1234 ABC');
  });

  it('removes control and invisible characters and trims', () => {
    expect(normalizeText('  a\u0000b​c﻿‮  ')).toBe('abc');
  });

  it('keeps line breaks only in multiline text', () => {
    expect(normalizeText('a\r\nb', { multiline: true })).toBe('a\nb');
    expect(normalizeText('a\nb')).toBe('a b');
  });

  it('keeps characters that look like markup, since text is always rendered as text', () => {
    expect(normalizeText('<5人 & A<B')).toBe('<5人 & A<B');
    expect(normalizeText('<script>alert(1)</script>')).toBe('<script>alert(1)</script>');
  });
});

describe('freeText and longText', () => {
  it('enforces min and max after normalization', () => {
    const name = freeText({ min: 1, max: 5 });
    expect(name.safeParse('   ').success).toBe(false);
    expect(name.parse(' 杉田工業 ')).toBe('杉田工業');
    expect(name.safeParse('123456').success).toBe(false);
  });

  it('keeps line breaks in long text', () => {
    expect(longText({ max: 100 }).parse('a\nb')).toBe('a\nb');
  });
});

describe('email', () => {
  it('normalizes and lowercases', () => {
    expect(email.parse(' Mike@Example.COM ')).toBe('mike@example.com');
  });

  it('rejects invalid addresses', () => {
    expect(email.safeParse('not-an-email').success).toBe(false);
  });
});

describe('postalCode (郵便番号 123-4567)', () => {
  it('accepts hyphen, full-width and spaces, stores 7 digits', () => {
    expect(postalCode.parse('123-4567')).toBe('1234567');
    expect(postalCode.parse('１２３－４５６７')).toBe('1234567');
    expect(postalCode.parse(' 1234567 ')).toBe('1234567');
  });

  it('rejects wrong lengths', () => {
    expect(postalCode.safeParse('12-34567').success).toBe(true);
    expect(postalCode.safeParse('123456').success).toBe(false);
    expect(postalCode.safeParse('12345678').success).toBe(false);
  });

  it('formats progressively while typing', () => {
    expect(formatPostalCode('123')).toBe('123');
    expect(formatPostalCode('1234')).toBe('123-4');
    expect(formatPostalCode('12345678')).toBe('123-4567');
  });
});

describe('mobilePhone (090-1234-5678)', () => {
  it('accepts 070, 080 and 090 in any format, stores 11 digits', () => {
    expect(mobilePhone.parse('090-1234-5678')).toBe('09012345678');
    expect(mobilePhone.parse('０８０１２３４５６７８')).toBe('08012345678');
    expect(mobilePhone.parse('070 1234 5678')).toBe('07012345678');
  });

  it('rejects landlines and wrong lengths', () => {
    expect(mobilePhone.safeParse('03-1234-5678').success).toBe(false);
    expect(mobilePhone.safeParse('090-1234-567').success).toBe(false);
  });

  it('formats progressively while typing', () => {
    expect(formatMobilePhone('090')).toBe('090');
    expect(formatMobilePhone('0901')).toBe('090-1');
    expect(formatMobilePhone('09012345')).toBe('090-1234-5');
    expect(formatMobilePhone('090123456789')).toBe('090-1234-5678');
  });
});

describe('landlinePhone (hyphen by area code)', () => {
  it('accepts valid Japanese landlines and stores digits', () => {
    expect(landlinePhone.parse('03-1234-5678')).toBe('0312345678');
    expect(landlinePhone.parse('０４３－２１２－３４５６')).toBe('0432123456');
  });

  it('rejects numbers that are not valid', () => {
    expect(landlinePhone.safeParse('12345').success).toBe(false);
    expect(landlinePhone.safeParse('0000000000').success).toBe(false);
  });

  it('formats by area code', () => {
    expect(formatLandlinePhone('0312345678')).toBe('03-1234-5678');
    expect(formatLandlinePhone('0432123456')).toBe('043-212-3456');
    expect(formatLandlinePhone('')).toBe('');
  });
});

describe('yen (CLAUDE.md, rule 2)', () => {
  it('accepts only non-negative integers', () => {
    expect(yen.parse(1047200)).toBe(1047200);
    expect(yen.safeParse(10.5).success).toBe(false);
    expect(yen.safeParse(-1).success).toBe(false);
  });

  it('formats in Japanese yen', () => {
    expect(formatYen(1047200)).toBe('￥1,047,200');
  });
});

describe('employee login ID and PIN (ADR 0016)', () => {
  it('accepts an 8-digit ID typed with or without hyphen', () => {
    expect(employeeLoginId.parse('4821-7305')).toBe('48217305');
    expect(employeeLoginId.safeParse('4821730').success).toBe(false);
    expect(formatEmployeeLoginId('48217305')).toBe('4821-7305');
  });

  it('refuses trivial PINs', () => {
    for (const p of ['0000', '1111', '1234', '4321', '6789']) expect(isTrivialPin(p)).toBe(true);
    for (const p of ['1357', '2580', '9182']) expect(isTrivialPin(p)).toBe(false);
    expect(pin.safeParse('1234').success).toBe(false);
    expect(pin.parse('１３５７')).toBe('1357');
    expect(pin.safeParse('123').success).toBe(false);
  });
});

describe('passwords (ADR 0024)', () => {
  it('requires at least 10 characters for a new password', () => {
    expect(newPassword.safeParse('123456789').success).toBe(false);
    expect(newPassword.safeParse('1234567890').success).toBe(true);
  });

  it('refuses passwords longer than bcrypt reads (72 bytes)', () => {
    expect(newPassword.safeParse('a'.repeat(73)).success).toBe(false);
    expect(newPassword.safeParse('あ'.repeat(25)).success).toBe(false); // 75 bytes in UTF-8
  });

  it('login only checks presence', () => {
    expect(loginPassword.safeParse('').success).toBe(false);
    expect(loginPassword.safeParse('x').success).toBe(true);
  });
});
