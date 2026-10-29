import { cn } from '@neo/ui';
import Link from 'next/link';
import { chainColorVar } from '../clientes/schema';
import type { CalendarDay } from './data';
import { shortTime } from './schema';

export interface GridLabels {
  employee: string;
  off: string;
  empty: string;
  caption: string;
}

function weekdayOf(day: string): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

/**
 * Employees × days grid, like the 勤怠表: each planned day shows the subcontractor color and
 * abbreviation (or the client), off days show 休 (R06-01). `detailed` adds hours and site (week).
 */
export function CalendarGrid({
  days,
  entries,
  locale,
  labels,
  today,
  detailed = false,
}: {
  days: string[];
  entries: CalendarDay[];
  locale: string;
  labels: GridLabels;
  today: string;
  detailed?: boolean;
}) {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' });

  const people = new Map<string, { name: string; cells: Map<string, CalendarDay[]> }>();
  for (const entry of entries) {
    const person = people.get(entry.employee_id) ?? {
      name: entry.employee_name,
      cells: new Map<string, CalendarDay[]>(),
    };
    const list = person.cells.get(entry.day) ?? [];
    list.push(entry);
    person.cells.set(entry.day, list);
    people.set(entry.employee_id, person);
  }
  const rows = [...people.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, locale));

  if (rows.length === 0) {
    return (
      <p className="m-0 rounded-lg border border-dashed border-line-strong bg-surface-1 px-6 py-10 text-center text-ink-muted">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface-1">
      <table className="w-full border-collapse text-xs">
        <caption className="sr-only">{labels.caption}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 min-w-[150px] border-r border-b border-line bg-surface-2 px-3 py-2 text-left type-label text-ink-muted"
            >
              {labels.employee}
            </th>
            {days.map((day) => {
              const dow = weekdayOf(day);
              return (
                <th
                  key={day}
                  scope="col"
                  abbr={fullDate.format(new Date(`${day}T00:00:00Z`))}
                  className={cn(
                    'border-b border-line bg-surface-2 px-1 py-1.5 text-center font-semibold',
                    detailed ? 'min-w-[108px]' : 'min-w-[40px]',
                    day === today && 'bg-primary-soft text-primary-text',
                  )}
                >
                  <span className="type-num block text-sm">{Number(day.slice(8))}</span>
                  <span
                    className={cn(
                      'block text-[11px] font-medium',
                      dow === 0 ? 'text-danger' : dow === 6 ? 'text-info' : 'text-ink-subtle',
                    )}
                  >
                    {weekday.format(new Date(`${day}T00:00:00Z`))}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map(([employeeId, person]) => (
            <tr
              key={employeeId}
              className="[&>td]:border-b [&>td]:border-line last:[&>td]:border-b-0"
            >
              <th
                scope="row"
                className="sticky left-0 z-10 border-r border-b border-line bg-surface-1 px-3 py-2 text-left text-sm font-medium whitespace-nowrap"
              >
                {person.name}
              </th>
              {days.map((day) => {
                const list = person.cells.get(day) ?? [];
                return (
                  <td
                    key={day}
                    className={cn(
                      'h-10 px-1 py-1 align-top',
                      day === today && 'bg-primary-soft/40',
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      {list.map((e) =>
                        e.off ? (
                          <span
                            key={e.member_id}
                            className="block text-center text-ink-subtle"
                            title={e.client_name}
                          >
                            {labels.off}
                          </span>
                        ) : (
                          <Link
                            key={e.member_id}
                            href={`/admin/escalacoes/${e.assignment_id}`}
                            title={[
                              e.client_name,
                              e.site_name,
                              `${shortTime(e.start_time)}–${shortTime(e.end_time)}`,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                            className="block rounded-xs border border-line border-l-[3px] bg-surface-2 px-1 py-0.5 text-left font-semibold text-ink no-underline hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-focus"
                            style={{
                              borderLeftColor: e.color
                                ? chainColorVar(e.color)
                                : 'var(--line-strong)',
                            }}
                          >
                            <span className="block truncate">
                              {e.abbreviation ?? Array.from(e.client_name)[0] ?? '?'}
                            </span>
                            {detailed ? (
                              <>
                                <span className="type-num block font-normal text-ink-muted">
                                  {shortTime(e.start_time)}–{shortTime(e.end_time)}
                                </span>
                                <span className="block truncate font-normal text-ink-subtle">
                                  {e.site_name ?? e.client_name}
                                </span>
                              </>
                            ) : null}
                          </Link>
                        ),
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
