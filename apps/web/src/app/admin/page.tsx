import { Badge, Card } from '@neo/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { officeMemberships } from '@/lib/destination';
import { activeCompanyId, getSession, userClient } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('title') };
}

const STATUS_VARIANT = {
  trial: 'info',
  active: 'success',
  past_due: 'warning',
  read_only: 'neutral',
  blocked: 'danger',
  canceled: 'outline',
} as const;

/** Placeholder until the company panel screens; shows the company the database lets this person see. */
export default async function AdminHomePage() {
  const t = await getTranslations('admin');
  const session = await getSession();
  if (!session) redirect('/login');
  const office = officeMemberships(session);
  const chosen = await activeCompanyId();
  const membership = office.find((m) => m.company_id === chosen) ?? office[0];
  if (!membership) redirect('/login');

  const supabase = await userClient();
  const { data, error } = await supabase.rpc('my_company_access', {
    p_company_id: membership.company_id,
  });
  if (error) throw error;
  const access = data as {
    display_name: string;
    code: string;
    status: keyof typeof STATUS_VARIANT;
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 type-h1">{access.display_name}</h1>
          <Badge variant={STATUS_VARIANT[access.status]} dot>
            {t(`status.${access.status}`)}
          </Badge>
        </div>
        <p className="m-0 text-ink-muted">{t('description')}</p>
        <p className="m-0 type-num text-ink-subtle">
          {access.code} · {session.email}
        </p>
        <div>
          <SignOutButton />
        </div>
      </Card>
    </main>
  );
}
