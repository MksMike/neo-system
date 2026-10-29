'use client';

import {
  Alert,
  Button,
  Field,
  Input,
  MobilePhoneInput,
  NativeSelect,
  Textarea,
  toast,
} from '@neo/ui';
import { Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAction } from '@/lib/use-action';
import { saveEmployee } from './actions';
import { EMPLOYMENT_TYPES, employeeSchema, NATIONALITIES, type EmploymentType } from './schema';

export interface EmployeeValues {
  fullName: string;
  nameKana: string;
  employmentType: EmploymentType | '';
  nationality: string;
  mobilePhone: string;
  hireDate: string;
  status: 'active' | 'inactive';
  note: string;
}

const EMPTY: EmployeeValues = {
  fullName: '',
  nameKana: '',
  employmentType: '',
  nationality: '',
  mobilePhone: '',
  hireDate: '',
  status: 'active',
  note: '',
};

/**
 * Employee registration (layer 05, demonstration fields). Creates with the id generated here, so
 * a retry never creates a second employee (ADR 0020), or edits with the version it was opened with.
 */
export function EmployeeForm({
  id: existingId,
  version,
  initial,
  onSaved,
}: {
  id?: string;
  version?: number;
  initial?: Partial<EmployeeValues>;
  onSaved?: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [id] = useState(() => existingId ?? crypto.randomUUID());
  const [values, setValues] = useState<EmployeeValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const save = useAction(saveEmployee, { idempotent: !existingId, toastOnError: false });
  const countryName = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale]);

  const set = (field: keyof EmployeeValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
  };
  const err = (field: string) => (errors[field] ? t(errors[field]) : undefined);

  async function submit() {
    setFormError(undefined);
    const input = {
      id,
      version,
      ...values,
      employmentType: values.employmentType as EmploymentType,
      status: existingId ? values.status : undefined,
    };
    const parsed = employeeSchema.safeParse(input);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join('.');
        out[key] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
      }
      setErrors(out);
      return;
    }
    setErrors({});
    const result = await save.run(input);
    if (result.ok) {
      toast.success(t('employees.saved'));
      if (onSaved) {
        onSaved();
        router.refresh();
      } else {
        router.push(`/admin/funcionarios/${result.data.id}`);
      }
      return;
    }
    if (result.detail === 'concurrent_update') setFormError(t('clients.errors.concurrent'));
    else if (result.fieldErrors) setErrors(result.fieldErrors);
    else setFormError(`${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4"
    >
      {formError ? <Alert variant="danger" title={formError} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t('employees.fields.fullName')} error={err('fullName')} required>
          <Input
            value={values.fullName}
            onChange={(e) => {
              set('fullName', e.target.value);
            }}
            maxLength={100}
            placeholder="Silva Mike"
            autoComplete="off"
          />
        </Field>
        <Field label={t('employees.fields.nameKana')} error={err('nameKana')}>
          <Input
            value={values.nameKana}
            onChange={(e) => {
              set('nameKana', e.target.value);
            }}
            maxLength={100}
            placeholder="シルバ マイク"
          />
        </Field>
        <Field label={t('employees.fields.employmentType')} error={err('employmentType')} required>
          <NativeSelect
            value={values.employmentType}
            onChange={(e) => {
              set('employmentType', e.target.value);
            }}
          >
            <option value="">{t('employees.choose')}</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`employees.types.${type}`)}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t('employees.fields.nationality')} error={err('nationality')}>
          <NativeSelect
            value={values.nationality}
            onChange={(e) => {
              set('nationality', e.target.value);
            }}
          >
            <option value="">{t('employees.choose')}</option>
            {NATIONALITIES.map((code) => (
              <option key={code} value={code}>
                {countryName.of(code) ?? code}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          label={t('employees.fields.mobilePhone')}
          error={err('mobilePhone')}
          help={t('employees.fields.mobilePhoneHelp')}
        >
          <MobilePhoneInput
            value={values.mobilePhone}
            onChange={(e) => {
              set('mobilePhone', e.target.value);
            }}
          />
        </Field>
        <Field label={t('employees.fields.hireDate')} error={err('hireDate')}>
          <Input
            type="date"
            value={values.hireDate}
            onChange={(e) => {
              set('hireDate', e.target.value);
            }}
          />
        </Field>
        {existingId ? (
          <Field label={t('employees.fields.status')}>
            <NativeSelect
              value={values.status}
              onChange={(e) => {
                set('status', e.target.value);
              }}
            >
              <option value="active">{t('employees.status.active')}</option>
              <option value="inactive">{t('employees.status.inactive')}</option>
            </NativeSelect>
          </Field>
        ) : null}
        <Field label={t('employees.fields.note')} error={err('note')} className="md:col-span-2">
          <Textarea
            value={values.note}
            onChange={(e) => {
              set('note', e.target.value);
            }}
            maxLength={1000}
            rows={3}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" variant="primary" loading={save.pending}>
          <Save aria-hidden />
          {existingId ? t('common.save') : t('employees.create')}
        </Button>
      </div>
    </form>
  );
}
