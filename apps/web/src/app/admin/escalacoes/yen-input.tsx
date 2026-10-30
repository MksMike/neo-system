'use client';

import { Input, type InputProps } from '@neo/ui';
import { digitsOnly } from '@neo/validation';
import { useTranslations } from 'next-intl';

/** Integer yen typed as digits and shown with thousands separators (20,000). */
export function YenInput({
  value,
  onValueChange,
  ...props
}: Omit<InputProps, 'value' | 'onChange'> & {
  value: string;
  onValueChange: (digits: string) => void;
}) {
  const t = useTranslations();
  return (
    <Input
      inputMode="numeric"
      value={value === '' ? '' : Number(value).toLocaleString('ja-JP')}
      onChange={(e) => {
        onValueChange(
          digitsOnly(e.target.value)
            .replace(/^0+(?=\d)/, '')
            .slice(0, 8),
        );
      }}
      suffix={t('assignments.yen')}
      className="type-num text-right"
      {...props}
    />
  );
}
