import { Button, EmptyState } from '@neo/ui';
import { addDays, businessDate, todayInTokyo } from '@neo/validation';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireOffice } from '@/server/office';
import { ChainSwatch } from '../clientes/chain-chips';
import { chainColorVar } from '../clientes/schema';
import { screenMetadata } from '../screen-placeholder';
import { SectionHeader } from '../section-header';
import { CalendarGrid } from './calendar-grid';
import { getCalendar, listAssignments } from './data';
import { shortTime } from './schema';

export const generateMetadata = () => screenMetadata('assignments', 'calendar');

function isoWeekday(day: string): number {
  return ((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;
}

/** Days of the month or of the week (Monday to Sunday) that contain `anchor`. */
function rangeOf(view: 'mes' | 'semana', anchor: string): string[] {
  let from: string;
  let to: string;
  if (view === 'semana') {
    from = addDays(anchor, 1 - isoWeekday(anchor));
    to = addDays(from, 6);
  } else {
    from = `${anchor.slice(0, 7)}-01`;
    const [y, m] = from.split('-').map(Number) as [number, number];
    to = addDays(
      m === 12 ? `${String(y + 1)}-01-01` : `${String(y)}-${String(m + 1).padStart(2, '0')}-01`,
      -1,
    );
  }
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

/** Calendar of the company: who works where, by month or by week (layer 06). */
export default async function AssignmentsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const office = await requireOffice('scheduling');
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const view = one(params.vista) === 'semana' ? 'semana' : 'mes';
  const today = todayInTokyo();
  const parsed = businessDate.safeParse(one(params.data));
  const anchor = parsed.success ? parsed.data : today;
  const days = rangeOf(view, anchor);
  const from = days[0] ?? today;
  const to = days.at(-1) ?? today;

  const [t, locale, entries, assignments] = await Promise.all([
    getTranslations(),
    getLocale(),
    getCalendar(office.companyId, from, to),
    listAssignments(office.companyId, from, to),
  ]);
  const prev = view === 'semana' ? addDays(from, -7) : addDays(from, -1);
  const next = addDays(to, 1);
  const href = (data: string, vista = view) => `/admin/escalacoes?vista=${vista}&data=${data}`;
  const title =
    view === 'semana'
      ? new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }).formatRange(new Date(`${from}T00:00:00Z`), new Date(`${to}T00:00:00Z`))
      : new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(
          new Date(`${from}T00:00:00Z`),
        );
  const dateRange = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        section="assignments"
        screen="calendar"
        actions={
          <Button asChild variant="primary">
            <Link href="/admin/escalacoes/nova">
              <Plus aria-hidden />
              {t('assignments.new')}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <nav
          aria-label={t('assignments.calendar.views')}
          className="inline-flex gap-0.5 rounded-md border border-line bg-surface-2 p-[3px]"
        >
          {(['mes', 'semana'] as const).map((v) => (
            <Link
              key={v}
              href={href(anchor, v)}
              aria-current={view === v ? 'page' : undefined}
              className="inline-flex h-8 items-center rounded-[8px] px-3 text-[13px] font-semibold text-ink-muted no-underline hover:text-ink aria-[current=page]:bg-surface-1 aria-[current=page]:text-ink aria-[current=page]:shadow-sm focus-visible:outline-2 focus-visible:outline-focus"
            >
              {t(`assignments.calendar.${v}`)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t('assignments.calendar.previous')}
          >
            <Link href={href(prev)}>
              <ChevronLeft aria-hidden />
            </Link>
          </Button>
          <h2 className="m-0 min-w-[180px] text-center type-h3">{title}</h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t('assignments.calendar.next')}
          >
            <Link href={href(next)}>
              <ChevronRight aria-hidden />
            </Link>
          </Button>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={href(today)}>{t('assignments.calendar.today')}</Link>
        </Button>
      </div>

      <CalendarGrid
        days={days}
        entries={entries}
        locale={locale}
        today={today}
        detailed={view === 'semana'}
        labels={{
          employee: t('assignments.members.employee'),
          off: t('assignments.calendar.off'),
          empty: t('assignments.calendar.empty'),
          caption: t('assignments.calendar.caption', { period: title }),
        }}
      />

      <section aria-labelledby="assignments-in-range" className="flex flex-col gap-3">
        <h2 id="assignments-in-range" className="m-0 type-h3">
          {t('assignments.inRange')}
        </h2>
        {assignments.length === 0 ? (
          <EmptyState
            icon={<CalendarDays aria-hidden />}
            title={t('assignments.emptyRange')}
            description={t('assignments.emptyRangeText')}
          />
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/escalacoes/${a.id}`}
                  className="mk-card relative flex h-full gap-3 rounded-lg border border-line bg-surface-1 p-4 text-ink no-underline shadow-sm transition-[box-shadow,border-color] duration-(--dur-base) hover:border-line-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <span
                    aria-hidden
                    className="w-1 shrink-0 self-stretch rounded-full"
                    style={{
                      background: a.chain ? chainColorVar(a.chain.color) : 'var(--line-strong)',
                    }}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-semibold">
                      {a.title ?? [a.clientName, a.siteName].filter(Boolean).join(' · ')}
                    </span>
                    {a.chain ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                        <ChainSwatch color={a.chain.color} className="size-2.5" />
                        {a.chain.abbreviation} · {a.chain.name}
                      </span>
                    ) : null}
                    <span className="type-num text-xs text-ink-subtle">
                      {dateRange.formatRange(
                        new Date(`${a.starts_on}T00:00:00Z`),
                        new Date(`${a.ends_on}T00:00:00Z`),
                      )}
                      {' · '}
                      {shortTime(a.start_time)}–{shortTime(a.end_time)}
                      {' · '}
                      {t('assignments.peopleCount', { count: a.memberCount })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
