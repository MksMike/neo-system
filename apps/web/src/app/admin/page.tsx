import { Badge, Card, CardHeader, CardTitle, PageHeader } from '@neo/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { activeOfficeMembership, userClient } from '@/server/session';
import { ADMIN_SECTIONS } from './sections';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.nav');
  return { title: t('dashboard') };
}

const STATUS_VARIANT = {
  trial: 'info',
  active: 'success',
  past_due: 'warning',
  read_only: 'neutral',
  blocked: 'danger',
  canceled: 'outline',
} as const;

/** Panel home: the company as the database lets this person see it, and shortcuts to the sections. */
export default async function AdminDashboardPage() {
  const membership = await activeOfficeMembership();
  if (!membership) redirect('/login');
  const [t, supabase] = await Promise.all([getTranslations('admin'), userClient()]);

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
    <div className="flex flex-col gap-6">
      <PageHeader title={t('nav.dashboard')} />

      <Card>
        <CardHeader>
          <CardTitle>{access.display_name}</CardTitle>
          <Badge variant={STATUS_VARIANT[access.status]} dot>
            {t(`status.${access.status}`)}
          </Badge>
        </CardHeader>
        <p className="m-0 type-num text-ink-subtle">{access.code}</p>
      </Card>

      <section aria-labelledby="dashboard-sections" className="flex flex-col gap-3">
        <h2 id="dashboard-sections" className="m-0 type-h3">
          {t('dashboard.sections')}
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {ADMIN_SECTIONS.map(({ key, href, icon: Icon }) => (
            <li key={key}>
              <Link
                href={href}
                className="mk-card relative flex h-full items-start gap-3 rounded-lg border border-line bg-surface-1 p-5 text-ink no-underline shadow-sm transition-[box-shadow,border-color,transform] duration-(--dur-base) ease-standard hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-focus"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary-text">
                  <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{t(`nav.${key}`)}</span>
                  <span className="block text-sm text-ink-muted">{t(`sections.${key}`)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
