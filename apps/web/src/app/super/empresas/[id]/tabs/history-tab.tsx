import { Badge, EmptyState } from '@neo/ui';
import { formatYen } from '@neo/validation';
import { History } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { STATUS_BADGE, type CompanyStatus } from '../../status';
import { type CompanyRow, getHistory, type HistoryEntry } from '../data';
import { getDateFormat } from '../format';

/** Timeline of status changes and Super Admin actions, newest first (R00-08). */
export async function HistoryTab({ company }: { company: CompanyRow }) {
  const [t, fmt, entries] = await Promise.all([
    getTranslations('super'),
    getDateFormat(),
    getHistory(company.id),
  ]);

  if (entries.length === 0) {
    return <EmptyState icon={<History aria-hidden />} title={t('company.history.empty')} />;
  }

  const statusLabel = (value: string | null | undefined) =>
    value ? t(`status.${value as CompanyStatus}`) : '—';

  function describe(entry: HistoryEntry): { title: string; detail?: string } {
    if (entry.kind === 'status') {
      return {
        title: t('company.history.statusChanged', {
          from: statusLabel(entry.fromStatus),
          to: statusLabel(entry.toStatus),
        }),
        detail: entry.reason ?? undefined,
      };
    }
    const p = entry.payload ?? {};
    const key = `company.history.actions.${entry.action.replaceAll('.', '_')}`;
    const title = t.has(key) ? t(key) : entry.action;
    if (entry.action === 'contract.changed' || entry.action === 'company.provisioned') {
      const type = (p.type ?? p.contract_type) as string | undefined;
      const parts = [
        type ? t(`contractType.${type as 'monthly'}`) : '',
        typeof p.price_yen === 'number' && p.price_yen > 0 ? formatYen(p.price_yen) : '',
        typeof p.valid_from === 'string'
          ? t('company.history.from', { date: fmt.date(p.valid_from) })
          : '',
      ].filter(Boolean);
      return { title, detail: parts.join(' · ') || undefined };
    }
    if (entry.action === 'company.modules_changed' && typeof p.valid_from === 'string') {
      const enabled = Array.isArray(p.enabled) ? p.enabled.length : 0;
      return {
        title,
        detail: t('company.history.modulesDetail', {
          count: enabled,
          date: fmt.date(p.valid_from),
        }),
      };
    }
    return { title };
  }

  return (
    <ol className="m-0 flex list-none flex-col gap-0 p-0">
      {entries.map((entry) => {
        const { title, detail } = describe(entry);
        return (
          <li
            key={entry.id}
            className="relative flex gap-4 border-l border-line pb-6 pl-5 last:pb-0"
          >
            <span
              aria-hidden
              className="absolute top-1.5 -left-[5px] size-[9px] rounded-full border-2 border-surface-1 bg-primary"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="m-0 font-semibold">{title}</p>
                {entry.kind === 'status' && entry.toStatus ? (
                  <Badge variant={STATUS_BADGE[entry.toStatus as CompanyStatus]} dot>
                    {t(`company.history.source.${entry.source === 'manual' ? 'manual' : 'auto'}`)}
                  </Badge>
                ) : null}
              </div>
              {detail ? <p className="m-0 text-sm text-ink-muted">{detail}</p> : null}
              <p className="m-0 text-xs text-ink-subtle">
                <time dateTime={entry.at} className="type-num">
                  {fmt.instant(entry.at)}
                </time>
                {entry.actor
                  ? ` · ${entry.actor}`
                  : entry.kind === 'status' && entry.source === 'auto'
                    ? ` · ${t('company.history.system')}`
                    : ''}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
