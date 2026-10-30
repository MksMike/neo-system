'use client';

import { dayUnitsHundredths } from '@neo/calc';
import {
  Alert,
  Badge,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  NativeSelect,
  toast,
} from '@neo/ui';
import { formatYen } from '@neo/validation';
import { Award, CalendarDays, ChevronDown, Clock, Star, Trash2, UserPlus, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAction } from '@/lib/use-action';
import { chainColorVar } from '../clientes/schema';
import { addEmployee, deleteAssignment } from './actions';
import type { FormOptions } from './assignment-form';
import type { Board, BoardDay } from './data';
import { DayDialog } from './day-dialog';
import { EditAssignmentDialog } from './edit-assignment-dialog';
import { hoursOf, periodDays, shortTime } from './schema';

export interface Employee {
  id: string;
  full_name: string;
}

/** Color of an employee on a day: 定時, 残業, 半日, 休 or not registered (R06-09). */
export function dayTone(d: Pick<BoardDay, 'status' | 'period' | 'overtime_minutes'>) {
  if (d.status === 'off') return 'yasumi';
  if (d.status === 'pending') return 'pending';
  if (d.overtime_minutes > 0) return 'zangyo';
  if (d.period === 'hannichi') return 'hannichi';
  return 'teiji';
}

function useDayFormats() {
  const locale = useLocale();
  return useMemo(() => {
    const md = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' });
    const wd = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
    const at = (d: string) => new Date(`${d}T00:00:00Z`);
    return {
      monthDay: (d: string) => md.format(at(d)),
      weekday: (d: string) => wd.format(at(d)),
      // Not formatRange: Node and the browser put different spaces around the dash (hydration).
      range: (a: string, b: string) => `${md.format(at(a))} – ${md.format(at(b))}`,
    };
  }, [locale]);
}

/** Per employee: worked days (定日), off days and overtime hours of the assignment. */
function summarize(days: BoardDay[]) {
  const people = new Map<string, { name: string; units: number; off: number; overtime: number }>();
  for (const d of days) {
    const p = people.get(d.employee_id) ?? { name: d.employeeName, units: 0, off: 0, overtime: 0 };
    p.units += dayUnitsHundredths(d.status, d.period, d.worked_minutes);
    if (d.status === 'off') p.off += 1;
    if (d.status === 'work') p.overtime += d.overtime_minutes;
    people.set(d.employee_id, p);
  }
  return [...people.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
}

/**
 * One assignment as a card that opens: summary per employee, actions and one card per day with the
 * employees of the day (layer 06). Clicking a day opens its details (R06-08).
 */
export function AssignmentBoard({
  board,
  employees,
  options,
  today,
  defaultOpen = false,
}: {
  board: Board;
  employees: Employee[];
  options: FormOptions;
  today: string;
  defaultOpen?: boolean;
}) {
  const t = useTranslations();
  const f = useDayFormats();
  const [open, setOpen] = useState(defaultOpen);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const days = periodDays(board.starts_on, board.ends_on);
  const byDay = useMemo(() => {
    const map = new Map<string, BoardDay[]>();
    for (const d of board.days) {
      const list = map.get(d.day) ?? [];
      list.push(d);
      map.set(d.day, list);
    }
    for (const list of map.values())
      list.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    return map;
  }, [board.days]);
  const people = summarize(board.days);
  const chains = [
    ...new Map(
      [board.chain, ...board.days.map((d) => d.chain)]
        .filter((c) => c !== null)
        .map((c) => [c.id, c]),
    ).values(),
  ];
  const hasExtra = board.extra_description !== null;
  // Status frame: yellow while a past day is still not registered, green otherwise.
  const unregistered = board.days.filter((d) => d.day < today && d.status === 'pending').length;

  return (
    <article
      id={`a-${board.id}`}
      className={cn(
        'mk-frame rounded-lg bg-surface-1',
        unregistered > 0 ? '[--frame:var(--warning)]' : '[--frame:var(--success)]',
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
        }}
        className="flex w-full cursor-pointer flex-wrap items-center gap-3 rounded-lg border-0 bg-transparent px-4 py-3 text-left text-ink focus-visible:outline-2 focus-visible:outline-focus"
      >
        <Award
          aria-label={hasExtra ? t('assignments.board.withExtra') : undefined}
          aria-hidden={!hasExtra}
          className={cn('size-5 shrink-0', hasExtra ? 'text-warning' : 'text-ink-subtle')}
        />
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="font-semibold">{board.clientName}</span>
          {chains.map((c) => (
            <Badge key={c.id} variant="outline" className="gap-1">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: chainColorVar(c.color) }}
              />
              {c.name || c.abbreviation}
            </Badge>
          ))}
          {board.title ? (
            <span className="truncate text-sm text-ink-muted">{board.title}</span>
          ) : null}
          {unregistered > 0 ? (
            <Badge variant="warning" dot>
              {t('assignments.board.unregistered', { count: unregistered })}
            </Badge>
          ) : null}
        </span>
        <span className="type-num inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <CalendarDays aria-hidden className="size-4" />
          {f.range(board.starts_on, board.ends_on)}
        </span>
        <ChevronDown
          aria-hidden
          className={cn('size-4 text-ink-subtle transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="flex flex-col gap-4 border-t border-line p-4">
          <div className="flex flex-wrap items-start gap-3">
            <ul className="m-0 flex flex-1 list-none flex-wrap gap-2 p-0">
              {people.length === 0 ? (
                <li className="text-sm text-ink-subtle">{t('assignments.members.empty')}</li>
              ) : (
                people.map(([id, p]) => (
                  <li
                    key={id}
                    className="flex flex-col items-center gap-1 rounded-md border border-line bg-surface-2 px-3 py-1.5 text-xs"
                  >
                    <span className="font-semibold text-ink">{p.name}</span>
                    <span className="type-num flex items-center gap-2 text-ink-muted">
                      <span
                        className="inline-flex items-center gap-0.5"
                        title={t('assignments.board.worked')}
                      >
                        <Star aria-hidden className="size-3 text-day-teiji" />
                        <span className="sr-only">{t('assignments.board.worked')}</span>
                        {(p.units / 100).toFixed(1)}
                      </span>
                      <span
                        className="inline-flex items-center gap-0.5"
                        title={t('assignments.board.off')}
                      >
                        <X aria-hidden className="size-3 text-day-yasumi" />
                        <span className="sr-only">{t('assignments.board.off')}</span>
                        {p.off}
                      </span>
                      <span
                        className="inline-flex items-center gap-0.5"
                        title={t('assignments.board.overtime')}
                      >
                        <Clock aria-hidden className="size-3 text-day-zangyo" />
                        <span className="sr-only">{t('assignments.board.overtime')}</span>
                        {hoursOf(p.overtime)}
                      </span>
                    </span>
                  </li>
                ))
              )}
            </ul>
            <div className="flex flex-wrap gap-2">
              <EditAssignmentDialog board={board} options={options} today={today} />
              <AddEmployeeDialog board={board} employees={employees} />
              <DeleteAssignmentDialog board={board} />
            </div>
          </div>

          <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
            <div className="flex gap-1.5">
              <dt>{t('assignments.fields.dayRate')}:</dt>
              <dd className="type-num m-0 text-ink">
                {formatYen(board.day_rate)} ({board.tax_rate}%
                {board.price_includes_tax ? ` ${t('assignments.taxIncluded')}` : ''})
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt>{t('assignments.board.hours')}:</dt>
              <dd className="type-num m-0 text-ink">
                {shortTime(board.start_time)}–{shortTime(board.end_time)}
              </dd>
            </div>
            {hasExtra ? (
              <div className="flex gap-1.5">
                <dt>{board.extra_description}:</dt>
                <dd className="type-num m-0 text-ink">
                  {t('assignments.board.extraValues', {
                    client: formatYen(board.extra_client_amount),
                    employee: formatYen(board.extra_employee_amount),
                  })}
                </dd>
              </div>
            ) : null}
            {board.note ? (
              <div className="flex basis-full gap-1.5">
                <dt>{t('assignments.fields.note')}:</dt>
                <dd className="m-0 whitespace-pre-wrap text-ink">{board.note}</dd>
              </div>
            ) : null}
          </dl>

          <ol className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 p-0">
            {days.map((day) => {
              const list = byDay.get(day) ?? [];
              const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
              return (
                <li key={day}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                    }}
                    aria-label={t('assignments.board.openDay', { day: f.monthDay(day) })}
                    className={cn(
                      'flex h-full min-h-24 w-full cursor-pointer flex-col gap-1 rounded-md border border-line bg-surface-2 p-2 text-left text-ink',
                      'transition-[border-color,box-shadow] duration-(--dur-fast) hover:border-line-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-focus',
                      day === today && 'border-primary',
                    )}
                  >
                    <span
                      className={cn(
                        'type-num text-center text-sm font-semibold',
                        dow === 0 && 'text-danger',
                        dow === 6 && 'text-info',
                      )}
                    >
                      {f.monthDay(day)} {f.weekday(day)}
                    </span>
                    {list.map((d) => (
                      <DayChip key={d.id} day={d} />
                    ))}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {selectedDay ? (
        <DayDialog
          board={board}
          day={selectedDay}
          entries={byDay.get(selectedDay) ?? []}
          employees={employees}
          options={options}
          onClose={() => {
            setSelectedDay(null);
          }}
        />
      ) : null}
    </article>
  );
}

/** An employee inside a day card: color by status, never color alone (icon and text too). */
function DayChip({ day: d }: { day: BoardDay }) {
  const t = useTranslations();
  const tone = dayTone(d);
  return (
    <span
      className="flex flex-col gap-0.5 rounded-xs border px-1.5 py-1 text-xs"
      style={{
        borderColor: `color-mix(in srgb, var(--day-${tone}) 45%, transparent)`,
        background: `color-mix(in srgb, var(--day-${tone}) 14%, var(--surface-1))`,
      }}
    >
      <span className="flex items-center justify-between gap-1">
        <span className="truncate font-semibold">{d.employeeName}</span>
        <span
          className="type-num inline-flex shrink-0 items-center gap-0.5"
          style={{ color: `var(--day-${tone})` }}
        >
          {tone === 'teiji' || tone === 'hannichi' ? <Star aria-hidden className="size-3" /> : null}
          {tone === 'zangyo' ? (
            <>
              <Clock aria-hidden className="size-3" />
              {hoursOf(d.overtime_minutes)}
            </>
          ) : null}
          {tone === 'yasumi' ? '休' : null}
          <span className="sr-only">{t(`assignments.status.${tone}`)}</span>
        </span>
      </span>
      {d.chain || d.siteName ? (
        <span className="truncate text-[11px] text-ink-muted">
          {[d.chain?.abbreviation, d.siteName].filter(Boolean).join(' › ')}
        </span>
      ) : null}
    </span>
  );
}

/** Puts an employee on every day of the period (R06-07). */
function AddEmployeeDialog({ board, employees }: { board: Board; employees: Employee[] }) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string>();
  const add = useAction(addEmployee, { idempotent: true, toastOnError: false });

  async function submit() {
    setError(undefined);
    if (!employeeId) {
      setError(t('assignments.members.chooseEmployee'));
      return;
    }
    const result = await add.run({ assignmentId: board.id, employeeId, startsOn: '', endsOn: '' });
    if (result.ok) {
      toast.success(t('assignments.members.added'));
      setOpen(false);
      setEmployeeId('');
      router.refresh();
      return;
    }
    setError(addEmployeeError(t, result));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <UserPlus aria-hidden />
          {t('assignments.members.add')}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t('common.close')}>
        <DialogTitle>{t('assignments.members.add')}</DialogTitle>
        <DialogDescription>{t('assignments.members.addHelp')}</DialogDescription>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-4"
        >
          {error ? <Alert variant="danger" title={error} /> : null}
          <Field label={t('assignments.members.employee')} required>
            <NativeSelect
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
              }}
            >
              <option value="">{t('assignments.choose')}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={add.pending}>
              {t('assignments.members.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function addEmployeeError(
  t: ReturnType<typeof useTranslations>,
  result: { detail?: string; message: string; requestId: string },
) {
  if (result.detail?.startsWith('schedule_overlap')) {
    return t('assignments.members.overlap', { day: result.detail.split(':')[1] ?? '' });
  }
  if (result.detail === 'member_outside_period') return t('assignments.members.outside');
  return `${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`;
}

function DeleteAssignmentDialog({ board }: { board: Board }) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const remove = useAction(deleteAssignment);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" iconOnly aria-label={t('assignments.delete')}>
          <Trash2 aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t('common.close')}>
        <DialogTitle>{t('assignments.delete')}</DialogTitle>
        <DialogDescription>
          {t('assignments.deleteConfirm', { client: board.clientName })}
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            loading={remove.pending}
            onClick={() => {
              void remove.run({ id: board.id, version: board.version }).then((r) => {
                if (r.ok) {
                  toast.success(t('assignments.deleted'));
                  setOpen(false);
                  router.refresh();
                }
              });
            }}
          >
            <Trash2 aria-hidden />
            {t('assignments.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
