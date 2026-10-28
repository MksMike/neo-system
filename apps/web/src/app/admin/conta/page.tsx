import { Badge, Card, CardHeader, CardTitle, PageHeader } from '@neo/ui';
import { User } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { activeOfficeMembership, getSession } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account');
  return { title: t('title') };
}

/** "Manage account" (account menu): who is signed in; profile photo and password come next. */
export default async function AccountPage() {
  const [session, membership, t, tRoles] = await Promise.all([
    getSession(),
    activeOfficeMembership(),
    getTranslations('account'),
    getTranslations('auth.roles'),
  ]);
  if (!session || !membership) redirect('/login');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} />
      <Card className="gap-4">
        <CardHeader>
          <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary-text">
            <User aria-hidden className="size-6" strokeWidth={1.75} />
          </span>
          <CardTitle>{session.displayName ?? session.email}</CardTitle>
          <Badge variant="primary">{tRoles(membership.role as 'owner')}</Badge>
        </CardHeader>
        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-subtle">{t('email')}</dt>
            <dd className="type-num m-0 text-sm">{session.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-subtle">{t('company')}</dt>
            <dd className="m-0 text-sm">{membership.display_name}</dd>
          </div>
        </dl>
        <p className="m-0 text-sm text-ink-muted">{t('soon')}</p>
      </Card>
    </div>
  );
}
