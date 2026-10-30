'use client';

import {
  Alert,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  Input,
  NativeSelect,
  SegmentedControl,
  Switch,
  Textarea,
  toast,
} from '@neo/ui';
import {
  CalendarCheck,
  CalendarX,
  ChevronDown,
  Save,
  Trash2,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { addEmployee, removeEmployee, saveDay, setDayStatus } from './actions';
import { addEmployeeError, dayTone, type Employee } from './assignment-board';
import type { FormOptions } from './assignment-form';
import type { Board, BoardDay } from './data';
import { daySchema, PERIODS, type DayStatus, type Period, shortTime, TAX_RATES } from './schema';
import { YenInput } from './yen-input';

/**
 * Details of one day of an assignment: the employees of the day, each editable in full (R06-08),
 * plus "add an employee only on this day" and "todos teiji / todos folga".
 */
export function DayDialog({
  board,
  day,
  entries,
  employees,
  options,
  onClose,
}: {
  board: Board;
  day: string;
  entries: BoardDay[];
  employees: Employee[];
  options: FormOptions;
  onClose: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string>();
  const add = useAction(addEmployee, { idempotent: true, toastOnError: false });
  const bulk = useAction(setDayStatus);
  const title = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`));
  const available = employees.filter((e) => !entries.some((d) => d.employee_id === e.id));

  async function addToDay() {
    setError(undefined);
    if (!employeeId) {
      setError(t('assignments.members.chooseEmployee'));
      return;
    }
    const result = await add.run({
      assignmentId: board.id,
      employeeId,
      startsOn: day,
      endsOn: day,
    });
    if (result.ok) {
      toast.success(t('assignments.members.added'));
      setAdding(false);
      setEmployeeId('');
      router.refresh();
      return;
    }
    setError(addEmployeeError(t, result));
  }

  function setAll(status: 'teiji' | 'off') {
    void bulk.run({ assignmentId: board.id, day, status }).then((r) => {
      if (r.ok) {
        toast.success(t('assignments.day.bulkDone'));
        router.refresh();
      }
    });
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        layout="drawer"
        closeLabel={t('common.close')}
        className="w-[min(560px,100vw)] overflow-y-auto"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {board.clientName}
          {board.title ? ` · ${board.title}` : ''}
        </DialogDescription>

        <div className="flex flex-col gap-3">
          {entries.length === 0 ? (
            <p className="m-0 text-sm text-ink-subtle">{t('assignments.day.empty')}</p>
          ) : (
            entries.map((d) => (
              <DayEmployee
                key={`${d.id}-${String(d.version)}`}
                day={d}
                board={board}
                options={options}
                open={expanded === d.id}
                onToggle={() => {
                  setExpanded((e) => (e === d.id ? null : d.id));
                }}
              />
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-4">
          {error ? <Alert variant="danger" title={error} /> : null}
          {adding ? (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void addToDay();
              }}
              className="flex flex-wrap items-end gap-2"
            >
              <Field label={t('assignments.members.employee')} className="min-w-50 flex-1">
                <NativeSelect
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                  }}
                >
                  <option value="">{t('assignments.choose')}</option>
                  {available.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Button type="submit" variant="primary" loading={add.pending}>
                {t('assignments.members.confirm')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAdding(false);
                }}
              >
                {t('common.cancel')}
              </Button>
            </form>
          ) : (
            <Button
              variant="secondary"
              className="self-center"
              disabled={available.length === 0}
              onClick={() => {
                setAdding(true);
              }}
            >
              <UserPlus aria-hidden />
              {t('assignments.day.addEmployee')}
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="soft"
              disabled={entries.length === 0}
              loading={bulk.pending}
              onClick={() => {
                setAll('teiji');
              }}
            >
              <CalendarCheck aria-hidden />
              {t('assignments.day.allTeiji')}
            </Button>
            <Button
              variant="secondary"
              disabled={entries.length === 0}
              loading={bulk.pending}
              onClick={() => {
                setAll('off');
              }}
            >
              <CalendarX aria-hidden />
              {t('assignments.day.allOff')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DayValues {
  status: DayStatus;
  period: Period;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  workedHours: string;
  overtimeHours: string;
  chainId: string;
  siteId: string;
  dayRate: string;
  taxRate: string;
  priceIncludesTax: boolean;
  meetingPlace: string;
  meetingTime: string;
  hasClientExtra: boolean;
  clientExtraDescription: string;
  clientExtraAmount: string;
  clientExtraTaxable: boolean;
  hasEmployeeExtra: boolean;
  employeeExtraDescription: string;
  employeeExtraAmount: string;
  hasFine: boolean;
  fineDescription: string;
  fineAmount: string;
  note: string;
}

const str = (n: number) => (n === 0 ? '' : String(n));
const hours = (minutes: number) => (minutes === 0 ? '' : String(minutes / 60));
const toMinutes = (h: string) => Math.round(Number(h.replace(',', '.') || '0') * 60);
const toInt = (v: string) => (v === '' ? 0 : Number(v));

function valuesOf(d: BoardDay): DayValues {
  return {
    status: d.status,
    period: d.period,
    startTime: shortTime(d.start_time),
    endTime: shortTime(d.end_time),
    breakMinutes: String(d.break_minutes),
    workedHours: hours(d.worked_minutes),
    overtimeHours: hours(d.overtime_minutes),
    chainId: d.chain_id ?? '',
    siteId: d.site_id ?? '',
    dayRate: str(d.day_rate),
    taxRate: String(d.tax_rate),
    priceIncludesTax: d.price_includes_tax,
    meetingPlace: d.meeting_place ?? '',
    meetingTime: shortTime(d.meeting_time),
    hasClientExtra: d.client_extra_description !== null,
    clientExtraDescription: d.client_extra_description ?? '',
    clientExtraAmount: str(d.client_extra_amount),
    clientExtraTaxable: d.client_extra_taxable,
    hasEmployeeExtra: d.employee_extra_description !== null,
    employeeExtraDescription: d.employee_extra_description ?? '',
    employeeExtraAmount: str(d.employee_extra_amount),
    hasFine: d.fine_description !== null,
    fineDescription: d.fine_description ?? '',
    fineAmount: str(d.fine_amount),
    note: d.note ?? '',
  };
}

/** One employee of the day: a summary row that opens into the full editor. */
function DayEmployee({
  day: d,
  board,
  options,
  open,
  onToggle,
}: {
  day: BoardDay;
  board: Board;
  options: FormOptions;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [v, setV] = useState<DayValues>(() => valuesOf(d));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const save = useAction(saveDay, { toastOnError: false });
  const remove = useAction(removeEmployee);
  const tone = dayTone(d);
  const chains = options.chains.filter((c) => c.clientId === board.client_id);
  const sites = options.sites.filter((s) => s.clientId === null || s.clientId === board.client_id);
  const set = <K extends keyof DayValues>(field: K, value: DayValues[K]) => {
    setV((x) => ({ ...x, [field]: value }));
  };
  const err = (field: string) => (errors[field] ? t(errors[field]) : undefined);

  async function submit() {
    setFormError(undefined);
    const input = {
      id: d.id,
      version: d.version,
      status: v.status,
      period: v.period,
      startTime: v.startTime,
      endTime: v.endTime,
      breakMinutes: toInt(v.breakMinutes),
      workedMinutes:
        v.period === 'hannichi' ? 240 : v.period === 'hourly' ? toMinutes(v.workedHours) : 480,
      overtimeMinutes: v.status === 'work' ? toMinutes(v.overtimeHours) : 0,
      chainId: v.chainId,
      siteId: v.siteId,
      dayRate: toInt(v.dayRate),
      taxRate: Number(v.taxRate),
      priceIncludesTax: v.priceIncludesTax,
      meetingPlace: v.meetingPlace,
      meetingTime: v.meetingTime,
      clientExtraDescription: v.hasClientExtra ? v.clientExtraDescription : '',
      clientExtraAmount: v.hasClientExtra ? toInt(v.clientExtraAmount) : 0,
      clientExtraTaxable: v.hasClientExtra && v.clientExtraTaxable,
      employeeExtraDescription: v.hasEmployeeExtra ? v.employeeExtraDescription : '',
      employeeExtraAmount: v.hasEmployeeExtra ? toInt(v.employeeExtraAmount) : 0,
      fineDescription: v.hasFine ? v.fineDescription : '',
      fineAmount: v.hasFine ? toInt(v.fineAmount) : 0,
      note: v.note,
    };
    const parsed = daySchema.safeParse(input);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join('.');
        out[key] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
      }
      setErrors(out);
      return;
    }
    const missing = (
      [
        [v.hasClientExtra, parsed.data.clientExtraDescription, 'clientExtraDescription'],
        [v.hasEmployeeExtra, parsed.data.employeeExtraDescription, 'employeeExtraDescription'],
        [v.hasFine, parsed.data.fineDescription, 'fineDescription'],
      ] as const
    ).find(([on, text]) => on && !text);
    if (missing) {
      setErrors({ [missing[2]]: 'validation.required' });
      return;
    }
    setErrors({});
    const result = await save.run(input as Parameters<typeof save.run>[0]);
    if (result.ok) {
      toast.success(t('assignments.day.saved'));
      router.refresh();
      return;
    }
    if (result.detail === 'concurrent_update') setFormError(t('clients.errors.concurrent'));
    else if (result.detail?.startsWith('schedule_overlap')) {
      setFormError(t('assignments.members.overlap', { day: d.day }));
    } else if (result.fieldErrors) setErrors(result.fieldErrors);
    else setFormError(`${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`);
  }

  function removeDays(all: boolean) {
    void remove
      .run({
        assignmentId: board.id,
        employeeId: d.employee_id,
        ...(all ? {} : { dayId: d.id }),
      })
      .then((r) => {
        if (r.ok) {
          toast.success(t('assignments.day.removed'));
          router.refresh();
        }
      });
  }

  return (
    <section
      className="rounded-md border bg-surface-2"
      style={{ borderColor: `color-mix(in srgb, var(--day-${tone}) 45%, var(--line))` }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-3 py-2 text-left text-ink focus-visible:outline-2 focus-visible:outline-focus"
      >
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: `var(--day-${tone})` }}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold">{d.employeeName}</span>
          <span className="truncate text-xs text-ink-muted">
            {d.chain || d.siteName
              ? [d.chain && (d.chain.name === '' ? d.chain.abbreviation : d.chain.name), d.siteName]
                  .filter(Boolean)
                  .join(' » ')
              : t('assignments.none')}
          </span>
        </span>
        <span className="text-xs font-semibold" style={{ color: `var(--day-${tone})` }}>
          {t(`assignments.status.${tone}`)}
        </span>
        <ChevronDown
          aria-hidden
          className={cn('size-4 text-ink-subtle transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-4 border-t border-line p-3"
        >
          {formError ? <Alert variant="danger" title={formError} /> : null}

          <SegmentedControl
            label={t('assignments.day.status')}
            value={v.status}
            onValueChange={(s) => {
              set('status', s as DayStatus);
            }}
            options={(['pending', 'work', 'off'] as const).map((s) => ({
              value: s,
              label: t(`assignments.day.statuses.${s}`),
            }))}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label={t('assignments.day.period')}>
              <NativeSelect
                value={v.period}
                onChange={(e) => {
                  set('period', e.target.value as Period);
                }}
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {t(`assignments.periods.${p}`)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t('assignments.fields.startTime')} error={err('startTime')}>
              <Input
                type="time"
                value={v.startTime}
                onChange={(e) => {
                  set('startTime', e.target.value);
                }}
              />
            </Field>
            <Field label={t('assignments.fields.endTime')} error={err('endTime')}>
              <Input
                type="time"
                value={v.endTime}
                onChange={(e) => {
                  set('endTime', e.target.value);
                }}
              />
            </Field>
            <Field label={t('assignments.fields.break')} error={err('breakMinutes')}>
              <Input
                inputMode="numeric"
                value={v.breakMinutes}
                onChange={(e) => {
                  set('breakMinutes', e.target.value.replace(/\D/g, '').slice(0, 3));
                }}
                suffix={t('assignments.minutes')}
                className="type-num"
              />
            </Field>
            {v.period === 'hourly' ? (
              <Field label={t('assignments.day.workedHours')} error={err('workedMinutes')}>
                <Input
                  inputMode="decimal"
                  value={v.workedHours}
                  onChange={(e) => {
                    set('workedHours', e.target.value.replace(/[^\d.,]/g, '').slice(0, 5));
                  }}
                  suffix="h"
                  className="type-num"
                />
              </Field>
            ) : null}
            <Field label={t('assignments.day.overtime')} error={err('overtimeMinutes')}>
              <Input
                inputMode="decimal"
                value={v.overtimeHours}
                disabled={v.status !== 'work'}
                onChange={(e) => {
                  set('overtimeHours', e.target.value.replace(/[^\d.,]/g, '').slice(0, 5));
                }}
                suffix="h"
                className="type-num"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('assignments.fields.chain')}>
              <NativeSelect
                value={v.chainId}
                onChange={(e) => {
                  set('chainId', e.target.value);
                }}
              >
                <option value="">{t('assignments.none')}</option>
                {chains.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.abbreviation} · {c.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t('assignments.fields.site')}>
              <NativeSelect
                value={v.siteId}
                onChange={(e) => {
                  set('siteId', e.target.value);
                }}
              >
                <option value="">{t('assignments.none')}</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t('assignments.fields.dayRate')} error={err('dayRate')}>
              <YenInput
                value={v.dayRate}
                onValueChange={(x) => {
                  set('dayRate', x);
                }}
              />
            </Field>
            <Field label={t('assignments.fields.taxRate')}>
              <NativeSelect
                value={v.taxRate}
                onChange={(e) => {
                  set('taxRate', e.target.value);
                }}
              >
                {TAX_RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="col-span-2">
              <Switch
                checked={v.priceIncludesTax}
                onCheckedChange={(on) => {
                  set('priceIncludesTax', on);
                }}
                label={t('assignments.fields.priceIncludesTax')}
              />
            </div>
            <Field label={t('assignments.fields.meetingPlace')} error={err('meetingPlace')}>
              <Input
                value={v.meetingPlace}
                onChange={(e) => {
                  set('meetingPlace', e.target.value);
                }}
                maxLength={200}
              />
            </Field>
            <Field label={t('assignments.fields.meetingTime')}>
              <Input
                type="time"
                value={v.meetingTime}
                onChange={(e) => {
                  set('meetingTime', e.target.value);
                }}
              />
            </Field>
          </div>

          <ToggleBlock
            on={v.hasFine}
            onChange={(on) => {
              set('hasFine', on);
            }}
            label={t('assignments.day.fine')}
            help={t('assignments.day.fineHelp')}
          >
            <Field label={t('assignments.day.description')} error={err('fineDescription')}>
              <Input
                value={v.fineDescription}
                onChange={(e) => {
                  set('fineDescription', e.target.value);
                }}
                maxLength={60}
              />
            </Field>
            <Field label={t('assignments.day.amount')} error={err('fineAmount')}>
              <YenInput
                value={v.fineAmount}
                onValueChange={(x) => {
                  set('fineAmount', x);
                }}
              />
            </Field>
          </ToggleBlock>

          <ToggleBlock
            on={v.hasEmployeeExtra}
            onChange={(on) => {
              set('hasEmployeeExtra', on);
            }}
            label={t('assignments.day.employeeExtra')}
            help={t('assignments.day.employeeExtraHelp')}
          >
            <Field label={t('assignments.day.description')} error={err('employeeExtraDescription')}>
              <Input
                value={v.employeeExtraDescription}
                onChange={(e) => {
                  set('employeeExtraDescription', e.target.value);
                }}
                maxLength={60}
              />
            </Field>
            <Field label={t('assignments.day.amount')} error={err('employeeExtraAmount')}>
              <YenInput
                value={v.employeeExtraAmount}
                onValueChange={(x) => {
                  set('employeeExtraAmount', x);
                }}
              />
            </Field>
          </ToggleBlock>

          <ToggleBlock
            on={v.hasClientExtra}
            onChange={(on) => {
              set('hasClientExtra', on);
            }}
            label={t('assignments.day.clientExtra')}
            help={t('assignments.day.clientExtraHelp')}
          >
            <Field label={t('assignments.day.description')} error={err('clientExtraDescription')}>
              <Input
                value={v.clientExtraDescription}
                onChange={(e) => {
                  set('clientExtraDescription', e.target.value);
                }}
                maxLength={60}
              />
            </Field>
            <Field label={t('assignments.day.amount')} error={err('clientExtraAmount')}>
              <YenInput
                value={v.clientExtraAmount}
                onValueChange={(x) => {
                  set('clientExtraAmount', x);
                }}
              />
            </Field>
            <div className="col-span-2">
              <Switch
                checked={v.clientExtraTaxable}
                onCheckedChange={(on) => {
                  set('clientExtraTaxable', on);
                }}
                label={t('assignments.fields.extraClientTaxable')}
              />
            </div>
          </ToggleBlock>

          <Field label={t('assignments.fields.note')} error={err('note')}>
            <Textarea
              value={v.note}
              onChange={(e) => {
                set('note', e.target.value);
              }}
              maxLength={500}
              rows={2}
            />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={remove.pending}
                onClick={() => {
                  removeDays(false);
                }}
              >
                <Trash2 aria-hidden />
                {t('assignments.day.removeDay')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={remove.pending}
                onClick={() => {
                  removeDays(true);
                }}
              >
                <UserMinus aria-hidden />
                {t('assignments.day.removeAll')}
              </Button>
            </div>
            <Button type="submit" variant="primary" size="sm" loading={save.pending}>
              <Save aria-hidden />
              {t('common.save')}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function ToggleBlock({
  on,
  onChange,
  label,
  help,
  children,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-line p-3">
      <Switch checked={on} onCheckedChange={onChange} label={label} />
      {on ? (
        <>
          <p className="m-0 text-xs text-ink-subtle">{help}</p>
          <div className="grid grid-cols-2 gap-3">{children}</div>
        </>
      ) : null}
    </div>
  );
}
