import { Card } from '@neo/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SignOutButton } from '@/components/sign-out-button';
import { getSession } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('super');
  return { title: t('title'), robots: { index: false } };
}

/** Placeholder until the Super Admin shell (SA-07). */
export default async function SuperHomePage() {
  const t = await getTranslations('super');
  const session = await getSession();
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <Card>
        <h1 className="m-0 type-h1">{t('title')}</h1>
        <p className="m-0 text-ink-muted">{t('description')}</p>
        <p className="m-0 type-num text-ink-subtle">{session?.email}</p>
        <div>
          <SignOutButton />
        </div>
      </Card>
    </main>
  );
}
