import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Input,
  NativeSelect,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@neo/ui';
import { formatYen } from '@neo/validation';
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { z } from 'zod';
import { userClient } from '@/server/session';
import { superMetadata } from '../placeholder';
import { CONTRACT_TYPES } from './schema';
import { businessDateValue, COMPANY_STATUSES, STATUS_BADGE, type CompanyStatus } from './status';

export const generateMetadata = () => superMetadata('companies');

const SORTS = ['code', 'name', 'paid_until', 'status'] as const;
const PAGE_SIZE = 20;

// Bad values in the URL fall back to the defaults instead of breaking the page.
const paramsSchema = z.object({
  q: z.string().max(100).catch(''),
  status: z.enum(COMPANY_STATUSES).optional().catch(undefined),
  contrato: z.enum(CONTRACT_TYPES).optional().catch(undefined),
  ordem: z.enum(SORTS).catch('code'),
  dir: z.enum(['asc', 'desc']).catch('asc'),
  pagina: z.coerce.number().int().min(1).max(10_000).catch(1),
  criada: z
    .string()
    .regex(/^[A-Z0-9]{3,12}$/)
    .optional()
    .catch(undefined),
});

interface CompanyRow {
  id: string;
  code: string;
  display_name: string;
  legal_name: string;
  status: CompanyStatus;
  is_investor: boolean;
  contract_type: (typeof CONTRACT_TYPES)[number] | null;
  price_yen: number | null;
  paid_until: string | null;
  module_count: number;
}

interface CompanyList {
  total: number;
  page: number;
  page_size: number;
  items: CompanyRow[];
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = paramsSchema.parse(
    Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])),
  );
  const [t, format, supabase] = await Promise.all([
    getTranslations('super'),
    getFormatter(),
    userClient(),
  ]);

  const { data, error } = await supabase.rpc('list_companies', {
    p: {
      q: params.q,
      status: params.status ?? null,
      contract_type: params.contrato ?? null,
      sort: params.ordem,
      dir: params.dir,
      page: params.pagina,
      page_size: PAGE_SIZE,
    },
  });
  if (error) throw error;
  const list = data as unknown as CompanyList;
  const filtered = params.q !== '' || params.status !== undefined || params.contrato !== undefined;

  const href = (changes: Partial<Record<keyof typeof params, string | number | undefined>>) => {
    const next = { ...params, criada: undefined, ...changes };
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === '') continue;
      if ((key === 'ordem' && value === 'code') || (key === 'dir' && value === 'asc')) continue;
      if (key === 'pagina' && value === 1) continue;
      query.set(key, String(value));
    }
    const qs = query.toString();
    return qs ? `/super/empresas?${qs}` : '/super/empresas';
  };

  const sortHeader = (key: (typeof SORTS)[number], label: string, align?: 'right') => {
    const active = params.ordem === key;
    const nextDir = active && params.dir === 'asc' ? 'desc' : 'asc';
    return (
      <TableHeaderCell
        align={align}
        aria-sort={active ? (params.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      >
        <Link
          href={href({ ordem: key, dir: nextDir, pagina: 1 })}
          className="inline-flex items-center gap-1 rounded-xs hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          {label}
          {active ? (
            params.dir === 'asc' ? (
              <ArrowUp aria-hidden className="size-3.5" />
            ) : (
              <ArrowDown aria-hidden className="size-3.5" />
            )
          ) : null}
        </Link>
      </TableHeaderCell>
    );
  };

  const first = list.total === 0 ? 0 : (list.page - 1) * list.page_size + 1;
  const last = Math.min(list.page * list.page_size, list.total);
  const lastPage = Math.max(1, Math.ceil(list.total / list.page_size));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('pages.companies.title')}
        description={t('pages.companies.description')}
        actions={
          <Button asChild variant="primary">
            <Link href="/super/empresas/nova">
              <Plus aria-hidden />
              {t('pages.companies.new')}
            </Link>
          </Button>
        }
      />

      {params.criada ? (
        <Alert variant="success" title={t('companies.created', { code: params.criada })}>
          {t('companies.createdText')}
        </Alert>
      ) : null}

      <form
        action="/super/empresas"
        method="get"
        role="search"
        aria-label={t('companies.filters.label')}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <span className="type-label text-ink-muted">{t('companies.filters.search')}</span>
          <Input
            name="q"
            type="search"
            defaultValue={params.q}
            maxLength={100}
            placeholder={t('companies.filters.searchPlaceholder')}
            icon={<Search aria-hidden />}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="type-label text-ink-muted">{t('companies.columns.status')}</span>
          <NativeSelect name="status" defaultValue={params.status ?? ''}>
            <option value="">{t('companies.filters.all')}</option>
            {COMPANY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="type-label text-ink-muted">{t('companies.columns.contract')}</span>
          <NativeSelect name="contrato" defaultValue={params.contrato ?? ''}>
            <option value="">{t('companies.filters.all')}</option>
            {CONTRACT_TYPES.map((c) => (
              <option key={c} value={c}>
                {t(`contractType.${c}`)}
              </option>
            ))}
          </NativeSelect>
        </label>
        {params.ordem !== 'code' ? <input type="hidden" name="ordem" value={params.ordem} /> : null}
        {params.dir !== 'asc' ? <input type="hidden" name="dir" value={params.dir} /> : null}
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            {t('companies.filters.apply')}
          </Button>
          {filtered ? (
            <Button asChild variant="ghost">
              <Link href="/super/empresas">{t('companies.filters.clear')}</Link>
            </Button>
          ) : null}
        </div>
      </form>

      {list.total === 0 ? (
        <EmptyState
          icon={<Building2 aria-hidden />}
          title={filtered ? t('companies.noResults') : t('pages.companies.emptyTitle')}
          description={filtered ? t('companies.noResultsText') : t('pages.companies.emptyText')}
          action={
            filtered ? (
              <Button asChild variant="secondary">
                <Link href="/super/empresas">{t('companies.filters.clear')}</Link>
              </Button>
            ) : (
              <Button asChild variant="primary">
                <Link href="/super/empresas/nova">
                  <Plus aria-hidden />
                  {t('pages.companies.new')}
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <Table aria-label={t('pages.companies.title')}>
            <TableHead>
              <TableRow>
                {sortHeader('code', t('companies.columns.code'))}
                {sortHeader('name', t('companies.columns.name'))}
                <TableHeaderCell>{t('companies.columns.contract')}</TableHeaderCell>
                <TableHeaderCell align="right">{t('companies.columns.modules')}</TableHeaderCell>
                {sortHeader('paid_until', t('companies.columns.paidUntil'))}
                {sortHeader('status', t('companies.columns.status'))}
              </TableRow>
            </TableHead>
            <TableBody>
              {list.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="type-num font-semibold">{c.code}</TableCell>
                  <TableCell>
                    <span className="block font-medium">{c.display_name}</span>
                    {c.display_name !== c.legal_name ? (
                      <span className="block text-xs text-ink-subtle">{c.legal_name}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {c.contract_type ? (
                      <>
                        <span className="block">{t(`contractType.${c.contract_type}`)}</span>
                        {c.contract_type !== 'partner' && c.price_yen ? (
                          <span className="type-num block text-xs text-ink-subtle">
                            {formatYen(c.price_yen)}
                          </span>
                        ) : c.is_investor ? (
                          <span className="block text-xs text-ink-subtle">
                            {t('companies.investor')}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right" className="type-num">
                    {c.module_count}
                  </TableCell>
                  <TableCell className="type-num whitespace-nowrap">
                    {c.contract_type === 'partner'
                      ? t('companies.lifetime')
                      : c.paid_until
                        ? format.dateTime(businessDateValue(c.paid_until), {
                            dateStyle: 'medium',
                            timeZone: 'UTC',
                          })
                        : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[c.status]} dot>
                      {t(`status.${c.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <nav
            aria-label={t('companies.pagination.label')}
            className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted"
          >
            <p className="m-0 type-num">
              {t('companies.pagination.range', { first, last, total: list.total })}
            </p>
            <div className="flex gap-2">
              {list.page > 1 ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href={href({ pagina: list.page - 1 })} rel="prev">
                    <ChevronLeft aria-hidden />
                    {t('companies.pagination.previous')}
                  </Link>
                </Button>
              ) : null}
              {list.page < lastPage ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href={href({ pagina: list.page + 1 })} rel="next">
                    {t('companies.pagination.next')}
                    <ChevronRight aria-hidden />
                  </Link>
                </Button>
              ) : null}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
