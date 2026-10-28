import {
  Alert,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@neo/ui';
import { todayInTokyo } from '@neo/validation';
import { getLocale, getTranslations } from 'next-intl/server';
import { type CompanyRow, getModuleCatalog, getModulePeriods } from '../data';
import { getDateFormat } from '../format';
import { ModulesEditor } from '../modules-editor';
import { SectionTitle } from '../parts';

export async function ModulesTab({ company }: { company: CompanyRow }) {
  const locale = await getLocale();
  const [t, fmt, catalog, periods] = await Promise.all([
    getTranslations('super.company'),
    getDateFormat(),
    getModuleCatalog(locale),
    getModulePeriods(company.id),
  ]);
  const today = todayInTokyo();
  // Open periods (no end): what the editor starts from and what the database compares against.
  const open = periods
    .filter((p) => p.valid_to === null)
    .map((p) => p.module_key)
    .sort((a, b) => catalog.findIndex((m) => m.key === a) - catalog.findIndex((m) => m.key === b));
  const name = (key: string) => catalog.find((m) => m.key === key)?.name ?? key;
  const periodState = (p: (typeof periods)[number]) =>
    p.valid_from > today
      ? 'scheduled'
      : p.valid_to !== null && p.valid_to < today
        ? 'ended'
        : 'active';

  return (
    <div className="flex flex-col gap-8">
      {company.status === 'canceled' ? (
        <Alert variant="info" title={t('readOnlyCanceled')} />
      ) : (
        <section className="flex flex-col gap-4" aria-labelledby="modules-edit">
          <SectionTitle>
            <span id="modules-edit">{t('modules.title')}</span>
          </SectionTitle>
          <p className="m-0 text-sm text-ink-muted">{t('modules.help')}</p>
          <ModulesEditor
            key={open.join(',')}
            companyId={company.id}
            catalog={catalog}
            current={open}
            today={today}
          />
        </section>
      )}

      <section className="flex flex-col gap-4" aria-labelledby="modules-periods">
        <SectionTitle>
          <span id="modules-periods">{t('modules.periods')}</span>
        </SectionTitle>
        <Table aria-label={t('modules.periods')}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('modules.module')}</TableHeaderCell>
              <TableHeaderCell>{t('modules.from')}</TableHeaderCell>
              <TableHeaderCell>{t('modules.to')}</TableHeaderCell>
              <TableHeaderCell>{t('modules.state')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-ink-subtle">
                  {t('modules.baseOnly')}
                </TableCell>
              </TableRow>
            ) : (
              periods.map((p) => {
                const state = periodState(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>{name(p.module_key)}</TableCell>
                    <TableCell className="type-num whitespace-nowrap">
                      {fmt.date(p.valid_from)}
                    </TableCell>
                    <TableCell className="type-num whitespace-nowrap">
                      {p.valid_to ? fmt.date(p.valid_to) : t('modules.noEnd')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          state === 'active'
                            ? 'success'
                            : state === 'scheduled'
                              ? 'info'
                              : 'neutral'
                        }
                        dot
                      >
                        {t(`modules.states.${state}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
