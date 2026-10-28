import { PageHeader } from '@neo/ui';
import { todayInTokyo } from '@neo/validation';
import { getLocale, getTranslations } from 'next-intl/server';
import { userClient } from '@/server/session';
import { superMetadata } from '../../placeholder';
import { CompanyWizard, type WizardCatalog } from './company-wizard';

export const generateMetadata = () => superMetadata('newCompany');

export default async function NewCompanyPage() {
  const [t, locale, supabase] = await Promise.all([
    getTranslations('super.pages.newCompany'),
    getLocale(),
    userClient(),
  ]);
  const name = locale === 'ja' ? 'name_ja' : 'name_pt';

  const [modules, plans, companies] = await Promise.all([
    supabase
      .from('module')
      .select('key, kind, depends_on, depends_any, name_ja, name_pt')
      .is('deleted_at', null)
      .order('sort_order'),
    supabase
      .from('plan_template')
      .select('key, module_keys, name_ja, name_pt')
      .is('deleted_at', null)
      .order('sort_order'),
    supabase
      .from('company')
      .select('id, code, display_name')
      .is('deleted_at', null)
      .neq('status', 'canceled')
      .order('code'),
  ]);
  for (const result of [modules, plans, companies]) if (result.error) throw result.error;

  const catalog: WizardCatalog = {
    modules: (modules.data ?? []).map((m) => ({
      key: m.key,
      kind: m.kind as 'base' | 'optional' | 'addon',
      depends_on: m.depends_on,
      depends_any: m.depends_any,
      name: m[name],
    })),
    plans: (plans.data ?? []).map((p) => ({ key: p.key, modules: p.module_keys, name: p[name] })),
    companies: companies.data ?? [],
    today: todayInTokyo(),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} description={t('description')} />
      <CompanyWizard catalog={catalog} />
    </div>
  );
}
