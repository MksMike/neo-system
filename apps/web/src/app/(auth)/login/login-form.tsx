'use client';

import { Alert, Button, Field, Input } from '@neo/ui';
import { Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { formText } from '@/lib/form-data';
import { useAction } from '@/lib/use-action';
import { signIn } from '../actions';

const KNOWN_DETAILS = ['invalid_credentials', 'no_access', 'too_many_attempts'] as const;

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const { run, pending } = useAction(signIn, { toastOnError: false });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFieldErrors({});
    setFormError(undefined);
    const result = await run({
      email: formText(form, 'email'),
      password: formText(form, 'password'),
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
      <Field label={t('auth.login.email')} error={fieldError('email')} required>
        <Input
          name="email"
          type="email"
          autoComplete="username"
          icon={<Mail aria-hidden />}
          size="lg"
        />
      </Field>
      <Field label={t('auth.login.password')} error={fieldError('password')} required>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          icon={<Lock aria-hidden />}
          size="lg"
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" block loading={pending}>
        {pending ? t('auth.login.submitting') : t('auth.login.submit')}
      </Button>
    </form>
  );
}
