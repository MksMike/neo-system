import { Card } from '@neo/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { officeMemberships } from '@/lib/destination';
import { getSession } from '@/server/session';
import { CompanyChoice } from './company-choice';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.select');
  return { title: t('title') };
}

export default async function SelectCompanyPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const companies = officeMemberships(session);
  if (companies.length === 0) redirect('/login');

  const t = await getTranslations('auth.select');
  return (
    <Card className="gap-5 p-6">
      <h1 className="m-0 type-h1">{t('title')}</h1>
      <CompanyChoice
        companies={companies.map((c) => ({
          id: c.company_id,
          code: c.code,
          name: c.display_name,
          role: c.role,
        }))}
      />
    </Card>
  );
}
