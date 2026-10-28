'use client';

import {
  Alert,
  Button,
  CardInset,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Radio,
  RadioGroup,
  Textarea,
  toast,
} from '@neo/ui';
import { addDays, digitsOnly } from '@neo/validation';
import { FilePen } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { z } from 'zod';
import { useAction } from '@/lib/use-action';
import { CONTRACT_TYPES, contractChangeSchema, nextBillingStart, PAYMENT_METHODS } from '../schema';
import { businessDateValue } from '../status';
import { changeContract } from './actions';

type ContractType = (typeof CONTRACT_TYPES)[number];
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface CurrentContract {
  id: string;
  type: ContractType;
  price_yen: number;
  payment_method: PaymentMethod | null;
  paid_until: string | null;
  valid_from: string;
}

// Error details from the database that belong to a field (ADR 0020).
const DETAIL_FIELDS: Record<string, [field: string, message: string]> = {
  billing_day_over_28: ['validFrom', 'validation.billingDayOver28'],
  valid_from_in_the_past: ['validFrom', 'validation.dateInPast'],
  valid_from_before_current: ['validFrom', 'super.company.contract.beforeCurrent'],
  price_yen_required: ['priceYen', 'validation.required'],
};

function issuesToErrors(issues: z.core.$ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.map(String).join('.') || '_';
    out[path] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
  }
  return out;
}

/** New contract version from a date (R00-05); the current one ends the day before. */
export function ContractChange({
  companyId,
  current,
  today,
  chargedUntil,
}: {
  companyId: string;
  current: CurrentContract | null;
  today: string;
  /** End of the last charge already generated: charges never change (R00-05). */
  chargedUntil: string | null;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ContractType | ''>(current?.type ?? '');
  const [price, setPrice] = useState(
    current && current.price_yen > 0 ? String(current.price_yen) : '',
  );
  const [method, setMethod] = useState<PaymentMethod | ''>(current?.payment_method ?? '');
  const minDate = current && current.valid_from > today ? current.valid_from : today;
  const [validFrom, setValidFrom] = useState(minDate);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const save = useAction(changeContract, { toastOnError: false });

  const err = (field: string) => (errors[field] ? t(errors[field]) : undefined);
  const date = (value: string) =>
    format.dateTime(businessDateValue(value), { dateStyle: 'long', timeZone: 'UTC' });
  const billingStart = validFrom ? nextBillingStart(current, validFrom) : '';

  async function submit() {
    setFormError(undefined);
    const input = {
      companyId,
      expectedContractId: current?.id ?? null,
      type: type as ContractType,
      priceYen: price ? Number(price) : undefined,
      paymentMethod: method || undefined,
      validFrom,
      note,
    };
    const parsed = contractChangeSchema.safeParse(input);
    let fieldErrors = parsed.success ? {} : issuesToErrors(parsed.error.issues);
    if (validFrom && validFrom < minDate) {
      fieldErrors = { validFrom: 'validation.dateInPast', ...fieldErrors };
    }
    if (type && type !== 'partner' && billingStart && Number(billingStart.slice(8)) > 28) {
      fieldErrors = { validFrom: 'validation.billingDayOver28', ...fieldErrors };
    }
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const result = await save.run(input);
    if (result.ok) {
      setOpen(false);
      toast.success(t('super.company.contract.saved'));
      router.refresh();
      return;
    }
    if (result.detail === 'contract_changed') {
      setFormError(t('super.company.conflict.text'));
      return;
    }
    const field = result.detail ? DETAIL_FIELDS[result.detail] : undefined;
    if (field) setErrors({ [field[0]]: field[1] });
    else if (result.fieldErrors) setErrors(result.fieldErrors);
    else setFormError(`${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setErrors({});
          setFormError(undefined);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <FilePen aria-hidden />
          {t('super.company.contract.change')}
        </Button>
      </DialogTrigger>
      <DialogContent layout="drawer" closeLabel={t('common.close')} className="overflow-y-auto">
        <DialogTitle>{t('super.company.contract.change')}</DialogTitle>
        <DialogDescription>{t('super.company.contract.changeHelp')}</DialogDescription>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-4"
        >
          {formError ? <Alert variant="danger" title={formError} /> : null}

          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="mb-2 type-label text-ink-muted">
              {t('super.wizard.contract.type')}
            </legend>
            <RadioGroup
              value={type}
              onValueChange={(v) => {
                setType(v as ContractType);
              }}
            >
              {CONTRACT_TYPES.map((ct) => (
                <Radio key={ct} value={ct} label={t(`super.contractType.${ct}`)} />
              ))}
            </RadioGroup>
            {err('type') ? <p className="m-0 text-xs text-danger">{err('type')}</p> : null}
          </fieldset>

          {type !== 'partner' ? (
            <>
              <Field
                label={t('super.wizard.contract.price')}
                error={err('priceYen')}
                help={t(
                  `super.wizard.contract.priceHelp.${type === 'annual' ? 'annual' : 'monthly'}`,
                )}
                required
              >
                <Input
                  inputMode="numeric"
                  value={price ? Number(price).toLocaleString('ja-JP') : ''}
                  onChange={(e) => {
                    setPrice(digitsOnly(e.target.value).slice(0, 12));
                  }}
                  suffix="円"
                  className="type-num"
                />
              </Field>
              <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
                <legend className="mb-1.5 type-label text-ink-muted">
                  {t('super.wizard.contract.paymentMethod')}
                </legend>
                <RadioGroup
                  value={method}
                  onValueChange={(v) => {
                    setMethod(v as PaymentMethod);
                  }}
                  className="flex-row gap-5"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <Radio key={m} value={m} label={t(`super.paymentMethod.${m}`)} />
                  ))}
                </RadioGroup>
                {err('paymentMethod') ? (
                  <p className="m-0 text-xs text-danger">{err('paymentMethod')}</p>
                ) : null}
              </fieldset>
            </>
          ) : null}

          <Field label={t('super.company.validFrom')} error={err('validFrom')} required>
            <Input
              type="date"
              min={minDate}
              value={validFrom}
              onChange={(e) => {
                setValidFrom(e.target.value);
              }}
            />
          </Field>
          <Field label={t('super.company.contract.note')} error={err('note')}>
            <Textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
              maxLength={500}
              rows={3}
            />
          </Field>

          {type && validFrom ? (
            <CardInset className="flex flex-col gap-1 text-sm">
              {current ? (
                <p className="m-0">
                  {validFrom > current.valid_from
                    ? t('super.company.contract.previousEnds', {
                        date: date(addDays(validFrom, -1)),
                      })
                    : t('super.company.contract.previousReplaced')}
                </p>
              ) : null}
              <p className="m-0">
                {type === 'partner'
                  ? t('super.company.contract.partnerFrom', { date: date(validFrom) })
                  : t('super.company.contract.paidFrom', { date: date(billingStart) })}
              </p>
              {chargedUntil && chargedUntil >= (type === 'partner' ? validFrom : billingStart) ? (
                <p className="m-0 text-warning">
                  {t('super.company.contract.alreadyCharged', { date: date(chargedUntil) })}
                </p>
              ) : null}
            </CardInset>
          ) : null}

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
            <Button type="submit" variant="primary" loading={save.pending}>
              {t('super.company.contract.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
