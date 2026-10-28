import { Alert, Card } from '@neo/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { destinationFor } from '@/lib/destination';
import { getSession } from '@/server/session';
import { LoginForm } from './login-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.login');
  return { title: t('title') };
}

const LINK_ERRORS = ['link_invalid'] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const session = await getSession();
  if (session) {
    const destination = destinationFor(session);
    if ('path' in destination) redirect(destination.path);
  }
  const t = await getTranslations('auth');
  const { erro } = await searchParams;
  const linkError = LINK_ERRORS.find((e) => e === erro);

  return (
    <Card className="gap-5 p-6">
      <div>
        <h1 className="m-0 type-h1">{t('login.title')}</h1>
        <p className="m-0 mt-1 text-ink-muted">{t('login.subtitle')}</p>
      </div>
      {linkError ? <Alert variant="warning" title={t(`errors.${linkError}`)} /> : null}
      <LoginForm />
    </Card>
  );
}
