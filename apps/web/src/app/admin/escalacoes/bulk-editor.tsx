'use client';

import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Checkbox,
  cn,
  DayCell,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  Field,
  Input,
  NativeSelect,
  SegmentedControl,
  Switch,
  toast,
} from '@neo/ui';
import {
  CalendarRange,
  Eraser,
  MousePointerClick,
  PencilLine,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAction } from '@/lib/use-action';
import { chainColorVar } from '../clientes/schema';
import { addEmployee, bulkUpdateDays, removeDays } from './actions';
import { addEmployeeError, dayTone, type Employee } from './assignment-board';
import type { FormOptions } from './assignment-form';
import type { Board, BoardDay } from './data';
import { DayDialog } from './day-dialog';
import { type BulkSet, hoursOf, PERIODS, type Period, periodDays, TAX_RATES } from './schema';
import { YenInput } from './yen-input';

type Action = 'status' | 'chain' | 'values' | 'people';
const KEEP = '__keep';

/**
 * Panel 2 (R06-11): the days of one assignment as an employees × days grid. Select a period (day
 * headers, shift+click to extend, or the date fields) and the employees (checkboxes or cells), then
 * apply one change to every selected day: status, subcontractor and site, values, add or remove.
 * A single selected day opens the same day details as panel 1.
 */
export function BulkEditor({
  boards,
  employees,
  options,
}: {
  boards: Board[];
  employees: Employee[];
  options: FormOptions;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [assignmentId, setAssignmentId] = useState(boards[0]?.id ?? '');
  const board = boards.find((b) => b.id === assignmentId) ?? boards[0];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<Action>('status');
  const [openDay, setOpenDay] = useState<string | null>(null);

  const days = board ? periodDays(board.starts_on, board.ends_on) : [];
  const people = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of board?.days ?? []) map.set(d.employee_id, d.employeeName);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], locale));
  }, [board, locale]);
  const cell = useMemo(() => {
    const map = new Map<string, BoardDay>();
    for (const d of board?.days ?? []) map.set(`${d.employee_id}|${d.day}`, d);
    return map;
  }, [board]);

  const inRange = (day: string) => from !== '' && day >= from && day <= (to || from);
  const selected = (board?.days ?? []).filter((d) => picked.has(d.employee_id) && inRange(d.day));
  const rangeDays = days.filter(inRange);
  const md = new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  const dayNumber = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  const wd = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const at = (d: string) => new Date(`${d}T00:00:00Z`);

  function choose(id: string) {
    setAssignmentId(id);
    setFrom('');
    setTo('');
    setPicked(new Set());
  }

  /** Click = that day only; shift+click = extend the period up to it. */
  function pickDay(day: string, extend: boolean) {
    if (extend && from) {
      setFrom(day < from ? day : from);
      setTo(day < from ? to || from : day);
    } else {
      setFrom(day);
      setTo(day);
    }
  }

  function pickCell(employeeId: string, day: string, extend: boolean) {
    pickDay(day, extend);
    setPicked((p) => (extend ? new Set(p).add(employeeId) : new Set([employeeId])));
  }

  function togglePerson(id: string, on: boolean) {
    setPicked((p) => {
      const next = new Set(p);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (!board) return null;

  return (
    <Card aria-labelledby="bulk-title">
      <CardHeader>
        <CalendarRange aria-hidden className="size-5 text-ink-muted" />
        <CardTitle id="bulk-title">{t('assignments.bulk.title')}</CardTitle>
      </CardHeader>
      <p className="m-0 flex items-center gap-1.5 text-sm text-ink-muted">
        <MousePointerClick aria-hidden className="size-4 shrink-0" />
        {t('assignments.bulk.help')}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <Field label={t('assignments.bulk.assignment')} className="min-w-60 flex-1">
          <NativeSelect
            value={board.id}
            onChange={(e) => {
              choose(e.target.value);
            }}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {[b.clientName, b.title].filter(Boolean).join(' · ')} ({md.format(at(b.starts_on))}–
                {md.format(at(b.ends_on))})
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t('assignments.bulk.from')}>
          <Input
            type="date"
            min={board.starts_on}
            max={board.ends_on}
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              if (!to || to < e.target.value) setTo(e.target.value);
            }}
          />
        </Field>
        <Field label={t('assignments.bulk.to')}>
          <Input
            type="date"
            min={from || board.starts_on}
            max={board.ends_on}
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
            }}
          />
        </Field>
        <Button
          variant="secondary"
          onClick={() => {
            setFrom(board.starts_on);
            setTo(board.ends_on);
            setPicked(new Set(people.map(([id]) => id)));
          }}
        >
          {t('assignments.bulk.selectAll')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setFrom('');
            setTo('');
            setPicked(new Set());
          }}
        >
          <Eraser aria-hidden />
          {t('assignments.bulk.clear')}
        </Button>
      </div>

      {people.length === 0 ? (
        <p className="m-0 text-sm text-ink-subtle">{t('assignments.members.empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full border-collapse text-xs">
            <caption className="sr-only">{t('assignments.bulk.gridCaption')}</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 min-w-44 border-b border-line bg-surface-2 px-2 py-1.5 text-left"
                >
                  <Checkbox
                    label={t('assignments.members.employee')}
                    checked={picked.size === people.length}
                    onCheckedChange={(on) => {
                      setPicked(on === true ? new Set(people.map(([id]) => id)) : new Set());
                    }}
                  />
                </th>
                {days.map((day) => {
                  const dow = at(day).getUTCDay();
                  return (
                    <th key={day} scope="col" className="border-b border-line bg-surface-2 p-0.5">
                      <button
                        type="button"
                        aria-pressed={inRange(day)}
                        aria-label={t('assignments.bulk.pickDay', { day: md.format(at(day)) })}
                        onClick={(e) => {
                          pickDay(day, e.shiftKey);
                        }}
                        className={cn(
                          'type-num flex w-full cursor-pointer flex-col items-center rounded-xs border-0 bg-transparent px-0.5 py-1 leading-tight text-ink hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-focus',
                          'aria-pressed:bg-primary-soft aria-pressed:text-primary-text',
                          dow === 0 && 'text-danger',
                          dow === 6 && 'text-info',
                        )}
                      >
                        <span>{dayNumber.format(at(day)).replace(/\D/g, '')}</span>
                        <span className="text-[10px]">{wd.format(at(day)).replace('.', '')}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {people.map(([id, name]) => (
                <tr key={id}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-line bg-surface-1 px-2 py-1 text-left font-normal"
                  >
                    <Checkbox
                      label={<span className="font-semibold">{name}</span>}
                      checked={picked.has(id)}
                      onCheckedChange={(on) => {
                        togglePerson(id, on === true);
                      }}
                    />
                  </th>
                  {days.map((day) => {
                    const d = cell.get(`${id}|${day}`);
                    const isSelected = picked.has(id) && inRange(day);
                    const tone = d ? dayTone(d) : null;
                    return (
                      <td key={day} className="border-b border-line p-0.5 text-center">
                        <DayCell
                          size="sm"
                          kind={!tone ? 'empty' : tone === 'zangyo' ? 'teiji' : tone}
                          mark={
                            !tone
                              ? ''
                              : tone === 'yasumi'
                                ? '休'
                                : tone === 'pending'
                                  ? '·'
                                  : tone === 'hannichi'
                                    ? '半'
                                    : '定'
                          }
                          overtime={
                            tone === 'zangyo' && d ? hoursOf(d.overtime_minutes) : undefined
                          }
                          subColor={d?.chain ? chainColorVar(d.chain.color) : undefined}
                          label={`${name} ${md.format(at(day))} ${tone ? t(`assignments.status.${tone}`) : t('assignments.bulk.notScheduled')}`}
                          aria-pressed={isSelected}
                          className={cn(isSelected && 'outline-2 outline-offset-1 outline-primary')}
                          onClick={(e) => {
                            pickCell(id, day, e.shiftKey);
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-md border border-line bg-surface-2 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-sm font-semibold" aria-live="polite">
            {from
              ? t('assignments.bulk.selection', {
                  count: selected.length,
                  people: picked.size,
                  days: rangeDays.length,
                })
              : t('assignments.bulk.nothing')}
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={rangeDays.length !== 1}
            onClick={() => {
              setOpenDay(rangeDays[0] ?? null);
            }}
          >
            <PencilLine aria-hidden />
            {t('assignments.bulk.openDay')}
          </Button>
        </div>

        <SegmentedControl
          label={t('assignments.bulk.action')}
          value={action}
          onValueChange={(v) => {
            setAction(v as Action);
          }}
          options={(['status', 'chain', 'values', 'people'] as const).map((a) => ({
            value: a,
            label: t(`assignments.bulk.actions.${a}`),
          }))}
        />

        {action === 'status' ? <StatusForm board={board} selected={selected} /> : null}
        {action === 'chain' ? (
          <ChainForm board={board} selected={selected} options={options} />
        ) : null}
        {action === 'values' ? <ValuesForm board={board} selected={selected} /> : null}
        {action === 'people' ? (
          <PeopleForm
            board={board}
            selected={selected}
            employees={employees}
            from={from}
            to={to || from}
          />
        ) : null}
      </div>

      {openDay ? (
        <DayDialog
          board={board}
          day={openDay}
          entries={board.days
            .filter((d) => d.day === openDay)
            .sort((a, b) => a.employeeName.localeCompare(b.employeeName, locale))}
          employees={employees}
          options={options}
          onClose={() => {
            setOpenDay(null);
            router.refresh();
          }}
        />
      ) : null}
    </Card>
  );
}

/** Runs a bulk change on the selected days, with the versions seen on screen. */
function useBulk(board: Board, selected: BoardDay[]) {
  const t = useTranslations();
  const router = useRouter();
  const update = useAction(bulkUpdateDays, { toastOnError: false });
  const [error, setError] = useState<string>();
  async function apply(set: BulkSet) {
    setError(undefined);
    if (selected.length === 0) {
      setError(t('assignments.bulk.selectFirst'));
      return;
    }
    const result = await update.run({
      assignmentId: board.id,
      days: selected.map((d) => ({ id: d.id, version: d.version })),
      set,
    });
    if (result.ok) {
      toast.success(t('assignments.bulk.applied', { count: result.data.changed }));
      router.refresh();
      return;
    }
    setError(
      result.detail === 'concurrent_update'
        ? t('assignments.bulk.conflict')
        : result.detail?.startsWith('schedule_overlap')
          ? t('assignments.members.overlap', { day: result.detail.split(':')[1] ?? '' })
          : `${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`,
    );
  }
  return { apply, pending: update.pending, error };
}

function ApplyButton({ pending, disabled }: { pending: boolean; disabled?: boolean }) {
  const t = useTranslations();
  return (
    <Button type="submit" variant="primary" loading={pending} disabled={disabled}>
      {t('assignments.bulk.apply')}
    </Button>
  );
}

function StatusForm({ board, selected }: { board: Board; selected: BoardDay[] }) {
  const t = useTranslations();
  const { apply, pending, error } = useBulk(board, selected);
  const [status, setStatus] = useState<'work' | 'off' | 'pending'>('work');
  const [period, setPeriod] = useState<Period>('teiji');
  const [overtime, setOvertime] = useState('');
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void apply(
          status === 'work'
            ? {
                status,
                period,
                overtimeMinutes: Math.round(Number(overtime.replace(',', '.') || '0') * 60),
              }
            : { status },
        );
      }}
      className="flex flex-wrap items-end gap-3"
    >
      {error ? <Alert variant="danger" title={error} className="basis-full" /> : null}
      <Field label={t('assignments.day.status')}>
        <NativeSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
          }}
        >
          {(['work', 'off', 'pending'] as const).map((s) => (
            <option key={s} value={s}>
              {t(`assignments.day.statuses.${s}`)}
            </option>
          ))}
        </NativeSelect>
      </Field>
      {status === 'work' ? (
        <>
          <Field label={t('assignments.day.period')}>
            <NativeSelect
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as Period);
              }}
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {t(`assignments.periods.${p}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t('assignments.day.overtime')} className="w-32">
            <Input
              inputMode="decimal"
              value={overtime}
              onChange={(e) => {
                setOvertime(e.target.value.replace(/[^\d.,]/g, '').slice(0, 5));
              }}
              suffix="h"
              className="type-num"
            />
          </Field>
        </>
      ) : null}
      <ApplyButton pending={pending} disabled={selected.length === 0} />
    </form>
  );
}

function ChainForm({
  board,
  selected,
  options,
}: {
  board: Board;
  selected: BoardDay[];
  options: FormOptions;
}) {
  const t = useTranslations();
  const { apply, pending, error } = useBulk(board, selected);
  const [chainId, setChainId] = useState(KEEP);
  const [siteId, setSiteId] = useState(KEEP);
  const chains = options.chains.filter((c) => c.clientId === board.client_id);
  const sites = options.sites.filter((s) => s.clientId === null || s.clientId === board.client_id);
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void apply({
          ...(chainId !== KEEP ? { chainId } : {}),
          ...(siteId !== KEEP ? { siteId } : {}),
        });
      }}
      className="flex flex-wrap items-end gap-3"
    >
      {error ? <Alert variant="danger" title={error} className="basis-full" /> : null}
      <Field label={t('assignments.fields.chain')} className="min-w-52">
        <NativeSelect
          value={chainId}
          onChange={(e) => {
            setChainId(e.target.value);
          }}
        >
          <option value={KEEP}>{t('assignments.bulk.keep')}</option>
          <option value="">{t('assignments.none')}</option>
          {chains.map((c) => (
            <option key={c.id} value={c.id}>
              {c.abbreviation} · {c.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label={t('assignments.fields.site')} className="min-w-52">
        <NativeSelect
          value={siteId}
          onChange={(e) => {
            setSiteId(e.target.value);
          }}
        >
          <option value={KEEP}>{t('assignments.bulk.keep')}</option>
          <option value="">{t('assignments.none')}</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <ApplyButton
        pending={pending}
        disabled={selected.length === 0 || (chainId === KEEP && siteId === KEEP)}
      />
    </form>
  );
}

function ValuesForm({ board, selected }: { board: Board; selected: BoardDay[] }) {
  const t = useTranslations();
  const { apply, pending, error } = useBulk(board, selected);
  const [dayRate, setDayRate] = useState('');
  const [taxRate, setTaxRate] = useState(KEEP);
  const [includesTax, setIncludesTax] = useState(KEEP);
  const [changeClient, setChangeClient] = useState(false);
  const [client, setClient] = useState({ description: '', amount: '', taxable: false });
  const [changeEmployee, setChangeEmployee] = useState(false);
  const [employee, setEmployee] = useState({ description: '', amount: '' });
  const set: BulkSet = {
    ...(dayRate !== '' ? { dayRate: Number(dayRate) } : {}),
    ...(taxRate !== KEEP ? { taxRate: Number(taxRate) as 0 | 8 | 10 } : {}),
    ...(includesTax !== KEEP ? { priceIncludesTax: includesTax === 'yes' } : {}),
    ...(changeClient
      ? {
          clientExtra: {
            description: client.description,
            amount: client.amount === '' ? 0 : Number(client.amount),
            taxable: client.taxable,
          },
        }
      : {}),
    ...(changeEmployee
      ? {
          employeeExtra: {
            description: employee.description,
            amount: employee.amount === '' ? 0 : Number(employee.amount),
          },
        }
      : {}),
  };
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void apply(set);
      }}
      className="flex flex-col gap-3"
    >
      {error ? <Alert variant="danger" title={error} /> : null}
      <div className="flex flex-wrap items-end gap-3">
        <Field
          label={t('assignments.fields.dayRate')}
          help={t('assignments.bulk.blankKeeps')}
          className="w-48"
        >
          <YenInput value={dayRate} onValueChange={setDayRate} />
        </Field>
        <Field label={t('assignments.fields.taxRate')}>
          <NativeSelect
            value={taxRate}
            onChange={(e) => {
              setTaxRate(e.target.value);
            }}
          >
            <option value={KEEP}>{t('assignments.bulk.keep')}</option>
            {TAX_RATES.map((r) => (
              <option key={r} value={r}>
                {r}%
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t('assignments.taxIncluded')}>
          <NativeSelect
            value={includesTax}
            onChange={(e) => {
              setIncludesTax(e.target.value);
            }}
          >
            <option value={KEEP}>{t('assignments.bulk.keep')}</option>
            <option value="yes">{t('assignments.bulk.yes')}</option>
            <option value="no">{t('assignments.bulk.no')}</option>
          </NativeSelect>
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-md border border-dashed border-line p-3">
          <Switch
            checked={changeClient}
            onCheckedChange={setChangeClient}
            label={t('assignments.day.clientExtra')}
          />
          {changeClient ? (
            <>
              <p className="m-0 text-xs text-ink-subtle">
                {t('assignments.bulk.extraBlankRemoves')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Field label={t('assignments.day.description')}>
                  <Input
                    value={client.description}
                    maxLength={60}
                    onChange={(e) => {
                      setClient({ ...client, description: e.target.value });
                    }}
                  />
                </Field>
                <Field label={t('assignments.day.amount')}>
                  <YenInput
                    value={client.amount}
                    onValueChange={(v) => {
                      setClient({ ...client, amount: v });
                    }}
                  />
                </Field>
              </div>
              <Switch
                checked={client.taxable}
                onCheckedChange={(on) => {
                  setClient({ ...client, taxable: on });
                }}
                label={t('assignments.fields.extraClientTaxable')}
              />
            </>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 rounded-md border border-dashed border-line p-3">
          <Switch
            checked={changeEmployee}
            onCheckedChange={setChangeEmployee}
            label={t('assignments.day.employeeExtra')}
          />
          {changeEmployee ? (
            <>
              <p className="m-0 text-xs text-ink-subtle">
                {t('assignments.bulk.extraBlankRemoves')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Field label={t('assignments.day.description')}>
                  <Input
                    value={employee.description}
                    maxLength={60}
                    onChange={(e) => {
                      setEmployee({ ...employee, description: e.target.value });
                    }}
                  />
                </Field>
                <Field label={t('assignments.day.amount')}>
                  <YenInput
                    value={employee.amount}
                    onValueChange={(v) => {
                      setEmployee({ ...employee, amount: v });
                    }}
                  />
                </Field>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div>
        <ApplyButton
          pending={pending}
          disabled={selected.length === 0 || Object.keys(set).length === 0}
        />
      </div>
    </form>
  );
}

function PeopleForm({
  board,
  selected,
  employees,
  from,
  to,
}: {
  board: Board;
  selected: BoardDay[];
  employees: Employee[];
  from: string;
  to: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string>();
  const [confirm, setConfirm] = useState(false);
  const add = useAction(addEmployee, { idempotent: true, toastOnError: false });
  const remove = useAction(removeDays, { toastOnError: false });

  async function addToPeriod() {
    setError(undefined);
    if (!from) {
      setError(t('assignments.bulk.pickPeriod'));
      return;
    }
    if (!employeeId) {
      setError(t('assignments.members.chooseEmployee'));
      return;
    }
    const result = await add.run({
      assignmentId: board.id,
      employeeId,
      startsOn: from,
      endsOn: to,
    });
    if (result.ok) {
      toast.success(t('assignments.bulk.added', { count: result.data.added }));
      setEmployeeId('');
      router.refresh();
      return;
    }
    setError(addEmployeeError(t, result));
  }

  async function removeSelected() {
    setError(undefined);
    const result = await remove.run({
      assignmentId: board.id,
      days: selected.map((d) => ({ id: d.id, version: d.version })),
    });
    setConfirm(false);
    if (result.ok) {
      toast.success(t('assignments.bulk.removed', { count: result.data.removed }));
      router.refresh();
      return;
    }
    setError(
      result.detail === 'concurrent_update'
        ? t('assignments.bulk.conflict')
        : `${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`,
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <Alert variant="danger" title={error} /> : null}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void addToPeriod();
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <Field
          label={t('assignments.bulk.addToPeriod')}
          help={t('assignments.bulk.addHelp')}
          className="min-w-60"
        >
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
        <Button type="submit" variant="primary" loading={add.pending} disabled={!from}>
          <UserPlus aria-hidden />
          {t('assignments.members.confirm')}
        </Button>
      </form>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <Button
          variant="secondary"
          className="self-start"
          disabled={selected.length === 0}
          onClick={() => {
            setConfirm(true);
          }}
        >
          <Trash2 aria-hidden />
          {t('assignments.bulk.removeSelected', { count: selected.length })}
        </Button>
        <DialogContent closeLabel={t('common.close')}>
          <DialogTitle>{t('assignments.bulk.removeTitle')}</DialogTitle>
          <DialogDescription>
            {t('assignments.bulk.removeConfirm', { count: selected.length })}
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirm(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              loading={remove.pending}
              onClick={() => {
                void removeSelected();
              }}
            >
              <Trash2 aria-hidden />
              {t('assignments.bulk.removeTitle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
