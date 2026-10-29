'use client';

import {
  Alert,
  Button,
  CardInset,
  Chip,
  Field,
  Input,
  NativeSelect,
  Textarea,
  toast,
} from '@neo/ui';
import { Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAction } from '@/lib/use-action';
import { saveAssignment } from './actions';
import { assignmentSchema, plannedDays, WEEKDAYS } from './schema';

export interface FormOptions {
  clients: { id: string; name: string }[];
  chains: { id: string; clientId: string; color: string; abbreviation: string; name: string }[];
  sites: { id: string; clientId: string | null; name: string }[];
}

export interface AssignmentValues {
  clientId: string;
  chainId: string;
  siteId: string;
  title: string;
  startsOn: string;
  endsOn: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  workDays: number[];
  meetingPlace: string;
  meetingTime: string;
  note: string;
}

/**
 * Assignment (escalação): client, subcontractor of its chain, site, period, hours, break, work
 * days and meeting point (layer 06, demonstration fields). Prices come in the M2/M3.
 */
export function AssignmentForm({
  options,
  today,
  id: existingId,
  version,
  initial,
  onSaved,
}: {
  options: FormOptions;
  today: string;
  id?: string;
  version?: number;
  initial?: AssignmentValues;
  onSaved?: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [id] = useState(() => existingId ?? crypto.randomUUID());
  const [values, setValues] = useState<AssignmentValues>(
    initial ?? {
      clientId: '',
      chainId: '',
      siteId: '',
      title: '',
      startsOn: today,
      endsOn: today,
      startTime: '08:00',
      endTime: '17:00',
      breakMinutes: '60',
      workDays: [1, 2, 3, 4, 5],
      meetingPlace: '',
      meetingTime: '',
      note: '',
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const save = useAction(saveAssignment, { idempotent: !existingId, toastOnError: false });

  const set = <K extends keyof AssignmentValues>(field: K, value: AssignmentValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
  };
  const err = (field: string) => (errors[field] ? t(errors[field]) : undefined);
  const chains = options.chains.filter((c) => c.clientId === values.clientId);
  const sites = options.sites.filter((s) => s.clientId === null || s.clientId === values.clientId);
  const weekdayName = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
    // 2024-01-01 was a Monday: ISO weekday n is 2024-01-0n.
    return (iso: number) => format.format(new Date(`2024-01-0${String(iso)}T00:00:00Z`));
  }, [locale]);
  const days = plannedDays(values.startsOn, values.endsOn, values.workDays);

  async function submit() {
    setFormError(undefined);
    const input = { id, version, ...values, breakMinutes: Number(values.breakMinutes) };
    const parsed = assignmentSchema.safeParse(input);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join('.');
        out[key] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
      }
      setErrors(out);
      return;
    }
    setErrors({});
    const result = await save.run(input);
    if (result.ok) {
      toast.success(t('assignments.saved'));
      if (onSaved) {
        onSaved();
        router.refresh();
      } else {
        router.push(`/admin/escalacoes/${result.data.id}`);
      }
      return;
    }
    const known: Record<string, [string, string]> = {
      members_outside_period: ['endsOn', 'assignments.errors.membersOutside'],
      period_invalid: ['endsOn', 'validation.endBeforeStart'],
    };
    const field = result.detail ? known[result.detail] : undefined;
    if (field) setErrors({ [field[0]]: field[1] });
    else if (result.detail === 'concurrent_update') setFormError(t('clients.errors.concurrent'));
    else if (result.fieldErrors) setErrors(result.fieldErrors);
    else setFormError(`${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-5"
    >
      {formError ? <Alert variant="danger" title={formError} /> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={t('assignments.fields.client')} error={err('clientId')} required>
          <NativeSelect
            value={values.clientId}
            onChange={(e) => {
              setValues((v) => ({ ...v, clientId: e.target.value, chainId: '', siteId: '' }));
            }}
          >
            <option value="">{t('assignments.choose')}</option>
            {options.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          label={t('assignments.fields.chain')}
          help={values.clientId && chains.length === 0 ? t('assignments.noChain') : undefined}
        >
          <NativeSelect
            value={values.chainId}
            disabled={!values.clientId}
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
        <Field
          label={t('assignments.fields.site')}
          help={values.clientId && sites.length === 0 ? t('assignments.noSite') : undefined}
        >
          <NativeSelect
            value={values.siteId}
            disabled={!values.clientId}
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
        <Field
          label={t('assignments.fields.title')}
          error={err('title')}
          help={t('assignments.fields.titleHelp')}
          className="md:col-span-3"
        >
          <Input
            value={values.title}
            onChange={(e) => {
              set('title', e.target.value);
            }}
            maxLength={120}
          />
        </Field>
        <Field label={t('assignments.fields.startsOn')} error={err('startsOn')} required>
          <Input
            type="date"
            value={values.startsOn}
            onChange={(e) => {
              set('startsOn', e.target.value);
            }}
          />
        </Field>
        <Field label={t('assignments.fields.endsOn')} error={err('endsOn')} required>
          <Input
            type="date"
            min={values.startsOn}
            value={values.endsOn}
            onChange={(e) => {
              set('endsOn', e.target.value);
            }}
          />
        </Field>
        <Field label={t('assignments.fields.break')} error={err('breakMinutes')}>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={480}
            step={15}
            value={values.breakMinutes}
            onChange={(e) => {
              set('breakMinutes', e.target.value.replace(/\D/g, '').slice(0, 3));
            }}
            suffix={t('assignments.minutes')}
            className="type-num"
          />
        </Field>
        <Field label={t('assignments.fields.startTime')} error={err('startTime')} required>
          <Input
            type="time"
            value={values.startTime}
            onChange={(e) => {
              set('startTime', e.target.value);
            }}
          />
        </Field>
        <Field
          label={t('assignments.fields.endTime')}
          error={err('endTime')}
          help={
            values.endTime && values.endTime < values.startTime
              ? t('assignments.overnight')
              : undefined
          }
          required
        >
          <Input
            type="time"
            value={values.endTime}
            onChange={(e) => {
              set('endTime', e.target.value);
            }}
          />
        </Field>
      </div>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 type-label text-ink-muted">
          {t('assignments.fields.workDays')}
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <Chip
              key={d}
              pressed={values.workDays.includes(d)}
              onPressedChange={(on) => {
                set(
                  'workDays',
                  on
                    ? [...values.workDays, d].sort((a, b) => a - b)
                    : values.workDays.filter((x) => x !== d),
                );
              }}
            >
              {weekdayName(d)}
            </Chip>
          ))}
        </div>
        {err('workDays') ? <p className="m-0 text-xs text-danger">{err('workDays')}</p> : null}
      </fieldset>

      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label={t('assignments.fields.meetingPlace')}
          error={err('meetingPlace')}
          className="md:col-span-2"
        >
          <Input
            value={values.meetingPlace}
            onChange={(e) => {
              set('meetingPlace', e.target.value);
            }}
            maxLength={200}
          />
        </Field>
        <Field label={t('assignments.fields.meetingTime')} error={err('meetingTime')}>
          <Input
            type="time"
            value={values.meetingTime}
            onChange={(e) => {
              set('meetingTime', e.target.value);
            }}
          />
        </Field>
        <Field label={t('assignments.fields.note')} error={err('note')} className="md:col-span-3">
          <Textarea
            value={values.note}
            onChange={(e) => {
              set('note', e.target.value);
            }}
            maxLength={1000}
            rows={2}
          />
        </Field>
      </div>

      <CardInset className="text-sm">{t('assignments.plannedDays', { count: days })}</CardInset>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" variant="primary" loading={save.pending}>
          <Save aria-hidden />
          {existingId ? t('common.save') : t('assignments.create')}
        </Button>
      </div>
    </form>
  );
}
