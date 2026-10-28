'use client';

import {
  formatEmployeeLoginId,
  formatLandlinePhone,
  formatMobilePhone,
  formatPostalCode,
} from '@neo/validation';
import type { ChangeEvent } from 'react';
import { Input, type InputProps } from './field';

type MaskedInputProps = Omit<InputProps, 'type' | 'inputMode'>;

/** Applies the mask on every keystroke and on paste, before onChange runs.
 * Works with controlled and uncontrolled inputs. The server validates again (ADR 0019). */
function masked(format: (value: string) => string, defaults: Partial<InputProps>) {
  function MaskedInput({ onChange, value, defaultValue, ...props }: MaskedInputProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.currentTarget.value = format(event.currentTarget.value);
      onChange?.(event);
    };
    return (
      <Input
        {...defaults}
        {...props}
        type="text"
        inputMode={defaults.inputMode}
        value={typeof value === 'string' ? format(value) : value}
        defaultValue={typeof defaultValue === 'string' ? format(defaultValue) : defaultValue}
        onChange={handleChange}
      />
    );
  }
  return MaskedInput;
}

/** 郵便番号 `123-4567`. */
export const PostalCodeInput = masked(formatPostalCode, {
  inputMode: 'numeric',
  autoComplete: 'postal-code',
  placeholder: '123-4567',
  maxLength: 8,
});

/** Mobile `090-1234-5678`. */
export const MobilePhoneInput = masked(formatMobilePhone, {
  inputMode: 'tel',
  autoComplete: 'tel-national',
  placeholder: '090-1234-5678',
  maxLength: 13,
});

/** Landline or fax, hyphens by area code (`03-1234-5678`). */
export const LandlinePhoneInput = masked(formatLandlinePhone, {
  inputMode: 'tel',
  autoComplete: 'tel-national',
  placeholder: '03-1234-5678',
  maxLength: 13,
});

/** Employee login ID `4821-7305` (ADR 0016). */
export const EmployeeIdInput = masked(formatEmployeeLoginId, {
  inputMode: 'numeric',
  autoComplete: 'username',
  placeholder: '0000-0000',
  maxLength: 9,
});
