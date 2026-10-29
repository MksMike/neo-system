import { isTrivialPin } from '@neo/validation';
import { describe, expect, it } from 'vitest';
import { derivePassword, generateLoginId, generatePin, technicalEmail } from './pin-login';

const PEPPER = 'x'.repeat(32);

describe('employee login by ID + PIN (ADR 0016)', () => {
  it('the ID always has 8 digits', () => {
    expect(generateLoginId(() => 10_000_000)).toBe('10000000');
    expect(generateLoginId(() => 99_999_999)).toBe('99999999');
    expect(generateLoginId()).toMatch(/^[1-9]\d{7}$/);
  });

  it('the PIN has 4 digits and is never trivial', () => {
    const values = [1111, 1234, 7]; // trivial, trivial, then 0007
    const pin = generatePin(() => values.shift() ?? 0);
    expect(pin).toBe('0007');
    for (let i = 0; i < 200; i += 1) {
      const p = generatePin();
      expect(p).toMatch(/^\d{4}$/);
      expect(isTrivialPin(p)).toBe(false);
    }
  });

  it('the technical e-mail never receives mail', () => {
    expect(technicalEmail('48217305')).toBe('48217305@pin.neo-system.invalid');
  });

  it('the password depends on ID, PIN and the server secret', () => {
    const a = derivePassword('48217305', '2580', PEPPER);
    expect(a).toBe(derivePassword('48217305', '2580', PEPPER));
    expect(a).not.toBe(derivePassword('48217305', '2581', PEPPER));
    expect(a).not.toBe(derivePassword('48217306', '2580', PEPPER));
    expect(a).not.toBe(derivePassword('48217305', '2580', 'y'.repeat(32)));
    expect(a.length).toBeGreaterThanOrEqual(40);
  });

  it('refuses a short secret', () => {
    expect(() => derivePassword('48217305', '2580', 'short')).toThrow();
  });
});
