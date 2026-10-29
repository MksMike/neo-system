import {
  Button,
  EmptyState,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@neo/ui';
import { formatLandlinePhone } from '@neo/validation';
import { Building2, Plus, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireOffice } from '@/server/office';
import { screenMetadata } from '../screen-placeholder';
import { SectionHeader } from '../section-header';
import { ChainChips } from './chain-chips';
import { listClients } from './data';

export const generateMetadata = () => screenMetadata('clients', 'list');

/** Clients of the company with the chain of subcontractors in their colors (layer 04). */
export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const office = await requireOffice('organizations');
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 100).trim() ?? '';
  const [t, clients] = await Promise.all([getTranslations(), listClients(office.companyId, q)]);
  const newButton = office.canEdit ? (
    <Button asChild variant="primary">
      <Link href="/admin/clientes/novo">
        <Plus aria-hidden />
        {t('clients.new')}
      </Link>
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section="clients" screen="list" actions={newButton} />

      <form
        action="/admin/clientes"
        method="get"
        role="search"
        aria-label={t('clients.search')}
        className="flex gap-2"
      >
        <Input
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          placeholder={t('clients.searchPlaceholder')}
          icon={<Search aria-hidden />}
          aria-label={t('clients.search')}
          wrapperClassName="max-w-[420px] flex-1"
        />
        <Button type="submit" variant="secondary">
          {t('clients.searchButton')}
        </Button>
      </form>

      {clients.length === 0 ? (
        <EmptyState
          icon={<Building2 aria-hidden />}
          title={q ? t('clients.noResults') : t('clients.empty')}
          description={q ? t('clients.noResultsText') : t('clients.emptyText')}
          action={q ? undefined : newButton}
        />
      ) : (
        <Table aria-label={t('admin.nav.clients')}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('clients.fields.name')}</TableHeaderCell>
              <TableHeaderCell>{t('clients.chain.title')}</TableHeaderCell>
              <TableHeaderCell align="right">{t('clients.sites.title')}</TableHeaderCell>
              <TableHeaderCell>{t('clients.fields.phone')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/admin/clientes/${c.id}`}
                    className="rounded-xs font-semibold text-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    {c.name}
                  </Link>
                  {c.name_kana ? (
                    <span className="block text-xs text-ink-subtle">{c.name_kana}</span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <ChainChips links={c.chain} empty={t('clients.chain.none')} />
                </TableCell>
                <TableCell align="right" className="type-num">
                  {c.siteCount}
                </TableCell>
                <TableCell className="type-num whitespace-nowrap">
                  {c.phone ? formatLandlinePhone(c.phone) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
