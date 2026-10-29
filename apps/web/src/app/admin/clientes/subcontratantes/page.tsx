import {
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@neo/ui';
import { Link2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireOffice } from '@/server/office';
import { screenMetadata } from '../../screen-placeholder';
import { SectionHeader } from '../../section-header';
import { ChainSwatch } from '../chain-chips';
import { LinkSubcontractor } from '../chain-editor';
import { clientOptions, listChains } from '../data';

export const generateMetadata = () => screenMetadata('clients', 'subcontractors');

/** Subcontractors linked to the clients, each with its color and abbreviation per client (R04-03). */
export default async function SubcontractorsPage() {
  const office = await requireOffice('organizations');
  const [t, links, clients] = await Promise.all([
    getTranslations(),
    listChains(office.companyId),
    clientOptions(office.companyId),
  ]);
  const clientName = new Map(clients.map((c) => [c.id, c.name]));
  const bySub = new Map<string, { name: string; links: typeof links }>();
  for (const l of links) {
    const entry = bySub.get(l.organization_id) ?? { name: l.name, links: [] };
    entry.links.push(l);
    bySub.set(l.organization_id, entry);
  }
  const subs = [...bySub.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, 'ja'));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        section="clients"
        screen="subcontractors"
        actions={
          office.canEdit && clients.length > 0 ? <LinkSubcontractor clients={clients} /> : null
        }
      />
      {subs.length === 0 ? (
        <EmptyState
          icon={<Link2 aria-hidden />}
          title={t('clients.subs.empty')}
          description={
            clients.length > 0 ? t('clients.subs.emptyText') : t('clients.subs.noClients')
          }
        />
      ) : (
        <Table aria-label={t('admin.screens.clients.subcontractors.title')}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('clients.chain.name')}</TableHeaderCell>
              <TableHeaderCell>{t('clients.subs.linkedTo')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subs.map(([id, sub]) => (
              <TableRow key={id}>
                <TableCell className="font-medium">{sub.name}</TableCell>
                <TableCell>
                  <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
                    {sub.links.map((l) => (
                      <li key={l.id} className="inline-flex items-center gap-1.5 text-sm">
                        <ChainSwatch color={l.color} />
                        <span className="font-semibold">{l.abbreviation}</span>
                        <span className="text-ink-subtle">·</span>
                        <Link
                          href={`/admin/clientes/${l.client_id}`}
                          className="rounded-xs text-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-focus"
                        >
                          {clientName.get(l.client_id) ?? '—'}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
