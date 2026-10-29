'use client';

import {
  Alert,
  Button,
  Field,
  Input,
  LandlinePhoneInput,
  PostalCodeInput,
  Textarea,
  toast,
} from '@neo/ui';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { saveOrganization } from './actions';
import { organizationSchema } from './schema';

export interface ClientValues {
  name: string;
  nameKana: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  invoiceRegNo: string;
  note: string;
}

const EMPTY: ClientValues = {
  name: '',
  nameKana: '',
  postalCode: '',
  address: '',
  phone: '',
  email: '',
  invoiceRegNo: '',
  note: '',
};

function errorsOf(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_';
    out[key] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
  }
  return out;
}

/**
 * Client registration (layer 04, demonstration fields). Creates with the id generated here, so a
 * retry never creates a second client (ADR 0020), or edits with the version it was opened with.
 */
export function ClientForm({
  initial,
  id: existingId,
  version,
  onSaved,
}: {
  initial?: Partial<ClientValues>;
  id?: string;
  version?: number;
  onSaved?: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [id] = useState(() => existingId ?? crypto.randomUUID());
  const [values, setValues] = useState<ClientValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const save = useAction(saveOrganization, { idempotent: !existingId, toastOnError: false });

  const set = (field: keyof ClientValues) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
  };
  const err = (field: string) => (errors[field] ? t(errors[field]) : undefined);

  async function submit() {
    setFormError(undefined);
    const input = { id, version, isClient: true, ...values };
    const parsed = organizationSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(errorsOf(parsed.error.issues));
      return;
    }
    setErrors({});
    const result = await save.run(input);
    if (result.ok) {
      toast.success(t('clients.saved'));
      if (onSaved) {
        onSaved();
        router.refresh();
      } else {
        router.push(`/admin/clientes/${result.data.id}`);
      }
      return;
    }
    if (result.detail === 'organization_duplicate') setErrors({ name: 'clients.errors.duplicate' });
    else if (result.detail === 'concurrent_update') setFormError(t('clients.errors.concurrent'));
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
        <Field
          label={t('clients.fields.name')}
          error={err('name')}
          required
          className="md:col-span-2"
        >
          <Input
            value={values.name}
            onChange={(e) => {
              set('name')(e.target.value);
            }}
            maxLength={200}
            placeholder="株式会社〇〇建設"
          />
        </Field>
        <Field label={t('clients.fields.nameKana')} error={err('nameKana')}>
          <Input
            value={values.nameKana}
            onChange={(e) => {
              set('nameKana')(e.target.value);
            }}
            maxLength={200}
          />
        </Field>
        <Field
          label={t('clients.fields.invoiceRegNo')}
          error={err('invoiceRegNo')}
          help={t('clients.fields.invoiceRegNoHelp')}
        >
          <Input
            value={values.invoiceRegNo}
            onChange={(e) => {
              set('invoiceRegNo')(e.target.value);
            }}
            maxLength={16}
            placeholder="T1234567890123"
            className="type-num"
          />
        </Field>
        <Field label={t('clients.fields.postalCode')} error={err('postalCode')}>
          <PostalCodeInput
            value={values.postalCode}
            onChange={(e) => {
              set('postalCode')(e.target.value);
            }}
          />
        </Field>
        <Field label={t('clients.fields.phone')} error={err('phone')}>
          <LandlinePhoneInput
            value={values.phone}
            onChange={(e) => {
              set('phone')(e.target.value);
            }}
          />
        </Field>
        <Field label={t('clients.fields.address')} error={err('address')} className="md:col-span-2">
          <Input
            value={values.address}
            onChange={(e) => {
              set('address')(e.target.value);
            }}
            maxLength={300}
          />
        </Field>
        <Field label={t('clients.fields.email')} error={err('email')}>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => {
              set('email')(e.target.value);
            }}
            maxLength={254}
          />
        </Field>
        <Field label={t('clients.fields.note')} error={err('note')} className="md:col-span-2">
          <Textarea
            value={values.note}
            onChange={(e) => {
              set('note')(e.target.value);
            }}
            maxLength={1000}
            rows={3}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" variant="primary" loading={save.pending}>
          <Save aria-hidden />
          {existingId ? t('common.save') : t('clients.create')}
        </Button>
      </div>
    </form>
  );
}
