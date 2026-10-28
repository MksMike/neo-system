import { Badge, TabNav, TabNavItem } from '@neo/ui';
import { ArrowLeft, Boxes, FileText, History, LayoutGrid, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { STATUS_BADGE, type CompanyStatus } from '../status';
import { getCompany } from './data';
import { ContractTab } from './tabs/contract-tab';
import { HistoryTab } from './tabs/history-tab';
import { ModulesTab } from './tabs/modules-tab';
import { SummaryTab } from './tabs/summary-tab';
import { UsersTab } from './tabs/users-tab';

const TABS = [
  { key: 'resumo', label: 'summary', icon: LayoutGrid },
  { key: 'modulos', label: 'modules', icon: Boxes },
  { key: 'contrato', label: 'contract', icon: FileText },
  { key: 'usuarios', label: 'users', icon: Users },
  { key: 'historico', label: 'history', icon: History },
] as const;
type TabKey = (typeof TABS)[number]['key'];

const tabSchema = z.enum(TABS.map((t) => t.key) as [TabKey, ...TabKey[]]).catch('resumo');

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function load(params: Props['params']) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const company = await getCompany(id);
  if (!company) notFound();
  return company;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await load(params);
  return { title: `${company.code} · ${company.display_name}`, robots: { index: false } };
}

/** Company page (layer 00, section 5): one URL per tab, rendered on the server. */
export default async function CompanyPage({ params, searchParams }: Props) {
  const company = await load(params);
  const raw = (await searchParams).aba;
  const tab = tabSchema.parse(Array.isArray(raw) ? raw[0] : raw);
  const t = await getTranslations('super');
  const status = company.status as CompanyStatus;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/super/empresas"
          className="inline-flex items-center gap-1.5 self-start rounded-xs text-[13px] font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t('company.back')}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 type-h1">{company.display_name}</h1>
          <span className="type-num rounded-sm bg-surface-3 px-2 py-1 text-xs font-semibold text-ink-muted">
            {company.code}
          </span>
          <Badge variant={STATUS_BADGE[status]} dot>
            {t(`status.${status}`)}
          </Badge>
          {company.is_investor ? <Badge variant="primary">{t('companies.investor')}</Badge> : null}
        </div>
        {company.display_name !== company.legal_name ? (
          <p className="m-0 text-ink-muted">{company.legal_name}</p>
        ) : null}
      </div>

      <TabNav aria-label={t('company.tabs.label')}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <TabNavItem key={key} asChild active={tab === key}>
            <Link
              href={`/super/empresas/${company.id}${key === 'resumo' ? '' : `?aba=${key}`}`}
              scroll={false}
            >
              <Icon aria-hidden />
              {t(`company.tabs.${label}`)}
            </Link>
          </TabNavItem>
        ))}
      </TabNav>

      {tab === 'resumo' ? <SummaryTab company={company} /> : null}
      {tab === 'modulos' ? <ModulesTab company={company} /> : null}
      {tab === 'contrato' ? <ContractTab company={company} /> : null}
      {tab === 'usuarios' ? <UsersTab company={company} /> : null}
      {tab === 'historico' ? <HistoryTab company={company} /> : null}
    </div>
  );
}
