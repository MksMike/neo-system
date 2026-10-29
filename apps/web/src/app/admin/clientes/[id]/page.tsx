import {
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@neo/ui';
import { formatLandlinePhone, formatPostalCode } from '@neo/validation';
import { ArrowLeft, Link2, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { requireOffice } from '@/server/office';
import { ChainSwatch } from '../chain-chips';
import { ChainRowActions, LinkSubcontractor } from '../chain-editor';
import { getOrganization, listChains, listSites } from '../data';
import { EditClientDialog } from '../edit-client-dialog';
import { SiteDialog } from '../site-dialog';

interface Props {
  params: Promise<{ id: string }>;
}

async function load(params: Props['params']) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const office = await requireOffice('organizations');
  const client = await getOrganization(office.companyId, id);
  if (!client?.is_client) notFound();
  return { office, client };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { client } = await load(params);
  return { title: client.name };
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="m-0 text-sm break-words">{children ?? '—'}</dd>
    </div>
  );
}

/** A client: data, the chain of subcontractors with color and abbreviation, and its work sites. */
export default async function ClientPage({ params }: Props) {
  const { office, client } = await load(params);
  const [t, chain, sites] = await Promise.all([
    getTranslations(),
    listChains(office.companyId, [client.id]),
    listSites(office.companyId, client.id),
  ]);
  const address = [
    client.postal_code ? `〒${formatPostalCode(client.postal_code)}` : '',
    client.address ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1.5 self-start rounded-xs text-[13px] font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t('admin.nav.clients')}
        </Link>
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="m-0 type-h1">{client.name}</h1>
            {client.name_kana ? (
              <p className="m-0 mt-1 text-ink-muted">{client.name_kana}</p>
            ) : null}
          </div>
          {office.canEdit ? (
            <EditClientDialog
              id={client.id}
              version={client.version}
              initial={{
                name: client.name,
                nameKana: client.name_kana ?? '',
                postalCode: client.postal_code ?? '',
                address: client.address ?? '',
                phone: client.phone ?? '',
                email: client.email ?? '',
                invoiceRegNo: client.invoice_reg_no ?? '',
                note: client.note ?? '',
              }}
            />
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('clients.data')}</CardTitle>
        </CardHeader>
        <dl className="m-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label={t('clients.fields.address')}>{address || null}</Info>
          <Info label={t('clients.fields.phone')}>
            {client.phone ? (
              <span className="type-num">{formatLandlinePhone(client.phone)}</span>
            ) : null}
          </Info>
          <Info label={t('clients.fields.email')}>{client.email}</Info>
          <Info label={t('clients.fields.invoiceRegNo')}>
            {client.invoice_reg_no ? (
              <span className="type-num">{client.invoice_reg_no}</span>
            ) : null}
          </Info>
          {client.note ? <Info label={t('clients.fields.note')}>{client.note}</Info> : null}
        </dl>
      </Card>

      <section aria-labelledby="client-chain" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="client-chain" className="m-0 type-h3">
            {t('clients.chain.title')}
          </h2>
          {office.canEdit ? (
            <LinkSubcontractor
              clientId={client.id}
              linkedIds={chain.map((l) => l.organization_id)}
            />
          ) : null}
        </div>
        {chain.length === 0 ? (
          <EmptyState
            icon={<Link2 aria-hidden />}
            title={t('clients.chain.empty')}
            description={t('clients.chain.emptyText')}
          />
        ) : (
          <Table aria-label={t('clients.chain.title')}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('clients.chain.position')}</TableHeaderCell>
                <TableHeaderCell>{t('clients.chain.name')}</TableHeaderCell>
                <TableHeaderCell>{t('clients.chain.abbreviation')}</TableHeaderCell>
                <TableHeaderCell>{t('clients.chain.colorLabel')}</TableHeaderCell>
                {office.canEdit ? (
                  <TableHeaderCell align="right">{t('clients.actions')}</TableHeaderCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {chain.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="type-num">{l.position}</TableCell>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="font-semibold">{l.abbreviation}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <ChainSwatch color={l.color} />
                      {t(`clients.colors.${l.color as 'teiji'}`)}
                    </span>
                  </TableCell>
                  {office.canEdit ? (
                    <TableCell align="right">
                      <span className="inline-flex justify-end">
                        <ChainRowActions
                          id={l.id}
                          version={l.version}
                          color={l.color}
                          name={l.name}
                        />
                      </span>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section aria-labelledby="client-sites" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="client-sites" className="m-0 type-h3">
            {t('clients.sites.title')}
          </h2>
          {office.canEdit ? <SiteDialog clientId={client.id} /> : null}
        </div>
        {sites.length === 0 ? (
          <EmptyState
            icon={<MapPin aria-hidden />}
            title={t('clients.sites.empty')}
            description={t('clients.sites.emptyText')}
          />
        ) : (
          <Table aria-label={t('clients.sites.title')}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('clients.sites.name')}</TableHeaderCell>
                <TableHeaderCell>{t('clients.fields.address')}</TableHeaderCell>
                <TableHeaderCell align="right">{t('clients.sites.radius')}</TableHeaderCell>
                {office.canEdit ? (
                  <TableHeaderCell align="right">{t('clients.actions')}</TableHeaderCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {sites.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-ink-muted">
                    {[s.postal_code ? `〒${formatPostalCode(s.postal_code)}` : '', s.address ?? '']
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </TableCell>
                  <TableCell align="right" className="type-num">
                    {s.radius_m} m
                  </TableCell>
                  {office.canEdit ? (
                    <TableCell align="right">
                      <SiteDialog
                        clientId={client.id}
                        site={{
                          id: s.id,
                          version: s.version,
                          name: s.name,
                          postalCode: s.postal_code ?? '',
                          address: s.address ?? '',
                          radiusM: s.radius_m,
                          note: s.note ?? '',
                        }}
                      />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
