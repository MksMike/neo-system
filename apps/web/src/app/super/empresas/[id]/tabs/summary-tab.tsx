import { Badge, Button } from '@neo/ui';
import { formatLandlinePhone, formatPostalCode, formatYen, todayInTokyo } from '@neo/validation';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { userClient } from '@/server/session';
import {
  type CompanyRow,
  getContracts,
  getModuleCatalog,
  getModulePeriods,
  splitContracts,
} from '../data';
import { getDateFormat } from '../format';
import { Info, InfoCard } from '../parts';

export async function SummaryTab({ company }: { company: CompanyRow }) {
  const locale = await getLocale();
  const [t, fmt, contracts, catalog, periods] = await Promise.all([
    getTranslations('super'),
    getDateFormat(),
    getContracts(company.id),
    getModuleCatalog(locale),
    getModulePeriods(company.id),
  ]);
  const today = todayInTokyo();
  const { inForce, scheduled } = splitContracts(contracts, today);
  const onToday = new Set(
    periods
      .filter((p) => p.valid_from <= today && (p.valid_to === null || p.valid_to >= today))
      .map((p) => p.module_key),
  );
  const modules = catalog.filter((m) => m.kind === 'base' || onToday.has(m.key));

  let referredBy: string | null = null;
  if (company.referred_by_company_id) {
    const supabase = await userClient();
    const { data } = await supabase
      .from('company')
      .select('code, display_name')
      .eq('id', company.referred_by_company_id)
      .maybeSingle();
    referredBy = data ? `${data.code} · ${data.display_name}` : null;
  }

  const address = [
    company.postal_code ? `〒${formatPostalCode(company.postal_code)}` : '',
    company.address ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InfoCard title={t('company.summary.data')} className="lg:row-span-2">
        <Info label={t('wizard.company.legalName')} wide>
          {company.legal_name}
        </Info>
        <Info label={t('wizard.company.legalNameKana')} wide>
          {company.legal_name_kana}
        </Info>
        <Info label={t('wizard.company.code')}>
          <span className="type-num">{company.code}</span>
        </Info>
        <Info label={t('wizard.company.invoiceRegNo')}>
          {company.invoice_reg_no ? (
            <span className="type-num">{company.invoice_reg_no}</span>
          ) : null}
        </Info>
        <Info label={t('wizard.company.address')} wide>
          {address || null}
        </Info>
        <Info label={t('wizard.company.phone')}>
          {company.phone ? formatLandlinePhone(company.phone) : null}
        </Info>
        <Info label={t('wizard.company.email')}>{company.email}</Info>
        <Info label={t('wizard.company.referredBy')}>{referredBy}</Info>
        <Info label={t('company.summary.createdAt')}>{fmt.instant(company.created_at)}</Info>
        {company.status_reason ? (
          <Info label={t('company.summary.statusReason')} wide>
            {company.status_reason}
          </Info>
        ) : null}
      </InfoCard>

      <InfoCard
        title={t('company.summary.contract')}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href={`/super/empresas/${company.id}?aba=contrato`}>
              {t('company.summary.seeAll')}
            </Link>
          </Button>
        }
      >
        {inForce ? (
          <>
            <Info label={t('wizard.contract.type')}>
              {t(`contractType.${inForce.type as 'monthly'}`)}
            </Info>
            {inForce.type !== 'partner' ? (
              <>
                <Info label={t('wizard.contract.price')}>
                  <span className="type-num">{formatYen(inForce.price_yen)}</span>
                </Info>
                <Info label={t('wizard.contract.paymentMethod')}>
                  {inForce.payment_method
                    ? t(`paymentMethod.${inForce.payment_method as 'cash'}`)
                    : null}
                </Info>
                <Info label={t('companies.columns.paidUntil')}>{fmt.date(inForce.paid_until)}</Info>
                {inForce.trial_ends_on && inForce.trial_ends_on >= today ? (
                  <Info label={t('company.contract.trialEnds')}>
                    {fmt.date(inForce.trial_ends_on)}
                  </Info>
                ) : null}
              </>
            ) : (
              <Info label={t('companies.columns.paidUntil')}>{t('companies.lifetime')}</Info>
            )}
          </>
        ) : (
          <Info label={t('wizard.contract.type')}>{null}</Info>
        )}
        {scheduled ? (
          <Info label={t('company.contract.scheduled')} wide>
            {t('company.contract.scheduledText', {
              date: fmt.date(scheduled.valid_from),
              type: t(`contractType.${scheduled.type as 'monthly'}`),
            })}
          </Info>
        ) : null}
      </InfoCard>

      <InfoCard
        title={t('company.summary.modules', { count: modules.length })}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href={`/super/empresas/${company.id}?aba=modulos`}>
              {t('company.summary.edit')}
            </Link>
          </Button>
        }
      >
        <div className="flex flex-wrap gap-1.5 sm:col-span-2">
          {modules.map((m) => (
            <Badge key={m.key} variant={m.kind === 'base' ? 'outline' : 'neutral'}>
              {m.name}
            </Badge>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}
