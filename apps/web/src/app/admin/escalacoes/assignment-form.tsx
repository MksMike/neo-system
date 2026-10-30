'use client';

import { splitPrice } from '@neo/calc';
import {
  Alert,
  Button,
  CardInset,
  Field,
  Input,
  NativeSelect,
  Switch,
  Textarea,
  toast,
} from '@neo/ui';
import { formatYen } from '@neo/validation';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { saveAssignment } from './actions';
import { assignmentSchema, periodDays, TAX_RATES, TITLE_SHOW_ON } from './schema';
import { YenInput } from './yen-input';

export interface FormOptions {
  clients: { id: string; name: string }[];
  chains: { id: string; clientId: string; color: string; abbreviation: string; name: string }[];
  sites: { id: string; clientId: string | null; name: string }[];
}

export interface AssignmentValues {
  clientId: string;
  chainId: string;
  siteId: string;
  hasTitle: boolean;
  title: string;
  titleShowOn: (typeof TITLE_SHOW_ON)[number];
  startsOn: string;
  endsOn: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  meetingPlace: string;
  meetingTime: string;
  dayRate: string;
  taxRate: string;
  priceIncludesTax: boolean;
  hasExtra: boolean;
  extraDescription: string;
  extraClientAmount: string;
  extraEmployeeAmount: string;
  extraClientTaxable: boolean;
  note: string;
}

/** First and last day of the month of `day`. */
function monthOf(day: string): [string, string] {
  const [y, m] = day.split('-').map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, '0');
  return [`${String(y)}-${mm}-01`, `${String(y)}-${mm}-${String(last).padStart(2, '0')}`];
}

const toInt = (v: string) => (v === '' ? 0 : Number(v));

/**
 * Assignment (escalação): one client and one closed month (R06-06), with the defaults every new
 * day starts from: subcontractor, site, hours, meeting point, price, tax and the extra per day.
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
  const router = useRouter();
  const [id] = useState(() => existingId ?? crypto.randomUUID());
  const [values, setValues] = useState<AssignmentValues>(() => {
    if (initial) return initial;
    const [first, last] = monthOf(today);
    return {
      clientId: '',
      chainId: '',
      siteId: '',
      hasTitle: false,
      title: '',
      titleShowOn: 'both',
      startsOn: first,
      endsOn: last,
      startTime: '08:00',
      endTime: '17:00',
      breakMinutes: '60',
      meetingPlace: '',
      meetingTime: '',
      dayRate: '',
      taxRate: '10',
      priceIncludesTax: false,
      hasExtra: false,
      extraDescription: '',
      extraClientAmount: '',
      extraEmployeeAmount: '',
      extraClientTaxable: false,
      note: '',
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const save = useAction(saveAssignment, { idempotent: !existingId, toastOnError: false });

  const set = <K extends keyof AssignmentValues>(field: K, value: AssignmentValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
  };
  const err = (field: string) => (errors[field] ? t(errors[field]) : undefined);
  const chains = options.chains.filter((c) => c.clientId === values.clientId);
  const sites = options.sites.filter((s) => s.clientId === null || s.clientId === values.clientId);
  const dayCount = periodDays(values.startsOn, values.endsOn).length;
  const price = splitPrice(toInt(values.dayRate), Number(values.taxRate), values.priceIncludesTax);
  const extraTotal = splitPrice(
    toInt(values.extraClientAmount),
    values.extraClientTaxable ? Number(values.taxRate) : 0,
    false,
  ).total;

  async function submit() {
    setFormError(undefined);
    const input = {
      id,
      version,
      clientId: values.clientId,
      chainId: values.chainId,
      siteId: values.siteId,
      title: values.hasTitle ? values.title : '',
      titleShowOn: values.titleShowOn,
      startsOn: values.startsOn,
      endsOn: values.endsOn,
      startTime: values.startTime,
      endTime: values.endTime,
      breakMinutes: toInt(values.breakMinutes),
      meetingPlace: values.meetingPlace,
      meetingTime: values.meetingTime,
      dayRate: toInt(values.dayRate),
      taxRate: Number(values.taxRate),
      priceIncludesTax: values.priceIncludesTax,
      extraDescription: values.hasExtra ? values.extraDescription : '',
      extraClientAmount: values.hasExtra ? toInt(values.extraClientAmount) : 0,
      extraEmployeeAmount: values.hasExtra ? toInt(values.extraEmployeeAmount) : 0,
      extraClientTaxable: values.hasExtra && values.extraClientTaxable,
      note: values.note,
    };
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
    if (values.hasTitle && !parsed.data.title) {
      setErrors({ title: 'validation.required' });
      return;
    }
    if (values.hasExtra && !parsed.data.extraDescription) {
      setErrors({ extraDescription: 'validation.required' });
      return;
    }
    setErrors({});
    const result = await save.run(input as Parameters<typeof save.run>[0]);
    if (result.ok) {
      toast.success(t('assignments.saved'));
      if (onSaved) onSaved();
      else router.push(`/admin/escalacoes/${result.data.id}`);
      router.refresh();
      return;
    }
    const known: Record<string, [string, string]> = {
      members_outside_period: ['endsOn', 'assignments.errors.membersOutside'],
      period_invalid: ['endsOn', 'validation.endBeforeStart'],
      period_too_long: ['endsOn', 'validation.periodTooLong'],
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
      </div>

      <CardInset className="flex flex-col gap-3">
        <Switch
          checked={values.hasTitle}
          onCheckedChange={(on) => {
            set('hasTitle', on);
          }}
          label={t('assignments.fields.hasTitle')}
        />
        {values.hasTitle ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label={t('assignments.fields.title')}
              error={err('title')}
              help={t('assignments.fields.titleHelp')}
              className="md:col-span-2"
              required
            >
              <Input
                value={values.title}
                onChange={(e) => {
                  set('title', e.target.value);
                }}
                maxLength={120}
              />
            </Field>
            <Field label={t('assignments.fields.titleShowOn')}>
              <NativeSelect
                value={values.titleShowOn}
                onChange={(e) => {
                  set('titleShowOn', e.target.value as AssignmentValues['titleShowOn']);
                }}
              >
                {TITLE_SHOW_ON.map((o) => (
                  <option key={o} value={o}>
                    {t(`assignments.showOn.${o}`)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
        ) : null}
      </CardInset>

      <div className="grid gap-4 md:grid-cols-4">
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
        <Field
          label={t('assignments.fields.meetingPlace')}
          error={err('meetingPlace')}
          help={t('assignments.fields.meetingPlaceHelp')}
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
      </div>

      <p className="m-0 text-sm text-ink-muted">
        {t('assignments.periodDays', { count: dayCount })}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t('assignments.fields.dayRate')} error={err('dayRate')} required>
          <YenInput
            value={values.dayRate}
            onValueChange={(v) => {
              set('dayRate', v);
            }}
          />
        </Field>
        <Field label={t('assignments.fields.taxRate')}>
          <NativeSelect
            value={values.taxRate}
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
        <Field label={t('assignments.fields.total')}>
          <Input readOnly value={formatYen(price.total)} className="type-num" tabIndex={-1} />
        </Field>
        <div className="sm:col-span-3">
          <Switch
            checked={values.priceIncludesTax}
            onCheckedChange={(on) => {
              set('priceIncludesTax', on);
            }}
            label={t('assignments.fields.priceIncludesTax')}
          />
        </div>
      </div>

      <CardInset className="flex flex-col gap-3">
        <Switch
          checked={values.hasExtra}
          onCheckedChange={(on) => {
            set('hasExtra', on);
          }}
          label={t('assignments.fields.hasExtra')}
        />
        {values.hasExtra ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('assignments.fields.extraDescription')}
              error={err('extraDescription')}
              className="sm:col-span-2"
              required
            >
              <Input
                value={values.extraDescription}
                onChange={(e) => {
                  set('extraDescription', e.target.value);
                }}
                maxLength={60}
                placeholder="出張手当"
              />
            </Field>
            <Field
              label={t('assignments.fields.extraClient')}
              help={t('assignments.perDay')}
              error={err('extraClientAmount')}
            >
              <YenInput
                value={values.extraClientAmount}
                onValueChange={(v) => {
                  set('extraClientAmount', v);
                }}
              />
            </Field>
            <Field
              label={t('assignments.fields.extraEmployee')}
              help={t('assignments.perDay')}
              error={err('extraEmployeeAmount')}
            >
              <YenInput
                value={values.extraEmployeeAmount}
                onValueChange={(v) => {
                  set('extraEmployeeAmount', v);
                }}
              />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              <Switch
                checked={values.extraClientTaxable}
                onCheckedChange={(on) => {
                  set('extraClientTaxable', on);
                }}
                label={t('assignments.fields.extraClientTaxable')}
              />
              <span className="type-num text-sm text-ink-muted">
                {t('assignments.extraTotal', { value: formatYen(extraTotal) })}
              </span>
            </div>
          </div>
        ) : null}
      </CardInset>

      <Field label={t('assignments.fields.note')} error={err('note')}>
        <Textarea
          value={values.note}
          onChange={(e) => {
            set('note', e.target.value);
          }}
          maxLength={1000}
          rows={2}
        />
      </Field>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" variant="primary" loading={save.pending}>
          <Save aria-hidden />
          {existingId ? t('common.save') : t('assignments.create')}
        </Button>
      </div>
    </form>
  );
}
