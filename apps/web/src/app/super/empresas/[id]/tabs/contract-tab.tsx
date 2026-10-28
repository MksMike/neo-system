import {
  Alert,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type BadgeProps,
} from '@neo/ui';
import { formatYen, todayInTokyo } from '@neo/validation';
import { getTranslations } from 'next-intl/server';
import { ContractChange, type CurrentContract } from '../contract-change';
import { type CompanyRow, getBilling, getContracts, splitContracts } from '../data';
import { getDateFormat } from '../format';
import { Info, InfoCard, SectionTitle } from '../parts';

const CHARGE_BADGE: Record<string, BadgeProps['variant']> = {
  open: 'warning',
  partial: 'info',
  paid: 'success',
  canceled: 'neutral',
};

export async function ContractTab({ company }: { company: CompanyRow }) {
  const [t, fmt, contracts, billing] = await Promise.all([
    getTranslations('super'),
    getDateFormat(),
    getContracts(company.id),
    getBilling(company.id),
  ]);
  const today = todayInTokyo();
  const { open, inForce, scheduled } = splitContracts(contracts, today);
  const type = (value: string) => t(`contractType.${value as 'monthly'}`);
  const method = (value: string | null) => (value ? t(`paymentMethod.${value as 'cash'}`) : '—');

  const chargedUntil =
    billing.charges
      .filter((c) => c.status !== 'canceled')
      .map((c) => c.period_end)
      .sort()
      .at(-1) ?? null;

  const current: CurrentContract | null = open
    ? {
        id: open.id,
        type: open.type as CurrentContract['type'],
        price_yen: open.price_yen,
        payment_method: open.payment_method as CurrentContract['payment_method'],
        paid_until: open.paid_until,
        valid_from: open.valid_from,
      }
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4" aria-labelledby="contract-current">
        <SectionTitle
          action={
            company.status !== 'canceled' ? (
              <ContractChange
                companyId={company.id}
                current={current}
                today={today}
                chargedUntil={chargedUntil}
              />
            ) : null
          }
        >
          <span id="contract-current">{t('company.contract.current')}</span>
        </SectionTitle>
        {scheduled ? (
          <Alert variant="info" title={t('company.contract.scheduled')}>
            {t('company.contract.scheduledText', {
              date: fmt.date(scheduled.valid_from),
              type: type(scheduled.type),
            })}
          </Alert>
        ) : null}
        {inForce ? (
          <InfoCard title={type(inForce.type)}>
            {inForce.type !== 'partner' ? (
              <>
                <Info label={t('wizard.contract.price')}>
                  <span className="type-num">{formatYen(inForce.price_yen)}</span>
                </Info>
                <Info label={t('wizard.contract.paymentMethod')}>
                  {method(inForce.payment_method)}
                </Info>
                <Info label={t('companies.columns.paidUntil')}>{fmt.date(inForce.paid_until)}</Info>
                <Info label={t('company.contract.billingDay')}>
                  {inForce.billing_start
                    ? inForce.type === 'monthly'
                      ? t('company.contract.everyMonth', {
                          day: Number(inForce.billing_start.slice(8)),
                        })
                      : t('company.contract.everyYear', { date: fmt.date(inForce.billing_start) })
                    : null}
                </Info>
                {inForce.trial_ends_on ? (
                  <Info label={t('company.contract.trialEnds')}>
                    {fmt.date(inForce.trial_ends_on)}
                  </Info>
                ) : null}
              </>
            ) : (
              <Info label={t('companies.columns.paidUntil')}>{t('companies.lifetime')}</Info>
            )}
            <Info label={t('company.contract.since')}>{fmt.date(inForce.valid_from)}</Info>
            {inForce.note ? (
              <Info label={t('company.contract.note')} wide>
                {inForce.note}
              </Info>
            ) : null}
          </InfoCard>
        ) : null}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="contract-versions">
        <SectionTitle>
          <span id="contract-versions">{t('company.contract.versions')}</span>
        </SectionTitle>
        <Table aria-label={t('company.contract.versions')}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('company.modules.from')}</TableHeaderCell>
              <TableHeaderCell>{t('company.modules.to')}</TableHeaderCell>
              <TableHeaderCell>{t('wizard.contract.type')}</TableHeaderCell>
              <TableHeaderCell align="right">{t('wizard.contract.price')}</TableHeaderCell>
              <TableHeaderCell>{t('wizard.contract.paymentMethod')}</TableHeaderCell>
              <TableHeaderCell>{t('company.contract.note')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="type-num whitespace-nowrap">
                  {fmt.date(c.valid_from)}
                </TableCell>
                <TableCell className="type-num whitespace-nowrap">
                  {c.valid_to ? fmt.date(c.valid_to) : t('company.modules.noEnd')}
                </TableCell>
                <TableCell>{type(c.type)}</TableCell>
                <TableCell align="right" className="type-num">
                  {c.type === 'partner' ? '—' : formatYen(c.price_yen)}
                </TableCell>
                <TableCell>{method(c.payment_method)}</TableCell>
                <TableCell className="max-w-[280px] text-ink-muted">{c.note ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="contract-charges">
        <SectionTitle>
          <span id="contract-charges">{t('company.billing.charges')}</span>
        </SectionTitle>
        {billing.charges.length === 0 ? (
          <p className="m-0 text-sm text-ink-subtle">{t('company.billing.noCharges')}</p>
        ) : (
          <Table aria-label={t('company.billing.charges')}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('company.billing.period')}</TableHeaderCell>
                <TableHeaderCell>{t('company.billing.dueOn')}</TableHeaderCell>
                <TableHeaderCell align="right">{t('company.billing.amount')}</TableHeaderCell>
                <TableHeaderCell align="right">{t('company.billing.paid')}</TableHeaderCell>
                <TableHeaderCell>{t('companies.columns.status')}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billing.charges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="type-num whitespace-nowrap">
                    {fmt.date(c.period_start)} – {fmt.date(c.period_end)}
                  </TableCell>
                  <TableCell className="type-num whitespace-nowrap">{fmt.date(c.due_on)}</TableCell>
                  <TableCell align="right" className="type-num">
                    {formatYen(c.amount_yen)}
                  </TableCell>
                  <TableCell align="right" className="type-num">
                    {formatYen(c.paid_yen)}
                    {c.fee_yen > 0 ? (
                      <span className="block text-xs text-ink-subtle">
                        {t('company.billing.fee', { fee: formatYen(c.fee_yen) })}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CHARGE_BADGE[c.status] ?? 'neutral'} dot>
                      {t(`company.billing.chargeStatus.${c.status as 'open'}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="contract-payments">
        <SectionTitle>
          <span id="contract-payments">{t('company.billing.payments')}</span>
        </SectionTitle>
        {billing.payments.length === 0 ? (
          <p className="m-0 text-sm text-ink-subtle">{t('company.billing.noPayments')}</p>
        ) : (
          <Table aria-label={t('company.billing.payments')}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('company.billing.paidOn')}</TableHeaderCell>
                <TableHeaderCell align="right">{t('company.billing.amount')}</TableHeaderCell>
                <TableHeaderCell>{t('wizard.contract.paymentMethod')}</TableHeaderCell>
                <TableHeaderCell>{t('company.billing.reference')}</TableHeaderCell>
                <TableHeaderCell>{t('company.billing.settlement')}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billing.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="type-num whitespace-nowrap">
                    {fmt.date(p.paid_on)}
                  </TableCell>
                  <TableCell align="right" className="type-num">
                    {formatYen(p.amount_yen)}
                  </TableCell>
                  <TableCell>{method(p.method)}</TableCell>
                  <TableCell className="text-ink-muted">{p.reference ?? '—'}</TableCell>
                  <TableCell>
                    {t(`company.billing.settlements.${p.settlement as 'full'}`)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
