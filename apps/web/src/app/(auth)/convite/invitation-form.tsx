'use client';

import { Alert, Button, Field, Input } from '@neo/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { formText } from '@/lib/form-data';
import { useAction } from '@/lib/use-action';
import { acceptInvitation } from '../actions';

const KNOWN_DETAILS = [
  'weak_password',
  'invitation_already_accepted',
  'invitation_not_found',
] as const;

export function InvitationForm() {
  const t = useTranslations();
  const router = useRouter();
  const { run, pending } = useAction(acceptInvitation, { toastOnError: false });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFieldErrors({});
    setFormError(undefined);
    const result = await run({
      password: formText(form, 'password'),
      confirm: formText(form, 'confirm'),
    });
    if (result.ok) {
      router.replace(result.data.redirectTo);
      router.refresh();
      return;
    }
    const known = KNOWN_DETAILS.find((d) => d === result.detail);
    if (known) setFormError(t(`auth.errors.${known}`));
    else if (result.fieldErrors) setFieldErrors(result.fieldErrors);
    else setFormError(t(result.message));
  }

  const fieldError = (name: string) => {
    const key = fieldErrors[name];
    return key ? t(key) : undefined;
  };

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      {formError ? <Alert variant="danger" title={formError} /> : null}
      <Field
        label={t('auth.invite.password')}
        help={t('auth.invite.passwordHelp')}
        error={fieldError('password')}
        required
      >
        <Input name="password" type="password" autoComplete="new-password" size="lg" />
      </Field>
      <Field label={t('auth.invite.confirm')} error={fieldError('confirm')} required>
        <Input name="confirm" type="password" autoComplete="new-password" size="lg" />
      </Field>
      <Button type="submit" variant="primary" size="lg" block loading={pending}>
        {t('auth.invite.submit')}
      </Button>
    </form>
  );
}
