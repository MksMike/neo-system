'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  CardInset,
  CardTitle,
  Checkbox,
  Field,
  Input,
  LandlinePhoneInput,
  NativeSelect,
  PostalCodeInput,
  Radio,
  RadioGroup,
  SegmentedControl,
  Steps,
} from '@neo/ui';
import {
  digitsOnly,
  formatLandlinePhone,
  formatPostalCode,
  formatYen,
  suggestCompanyCode,
} from '@neo/validation';
import { ArrowLeft, ArrowRight, Building2, Check, Pencil } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { z } from 'zod';
import {
  dependentsOf,
  enableModule,
  missingAnyDependency,
  modulesForPlan,
  type ModuleDef,
} from '@/lib/modules';
import { useAction } from '@/lib/use-action';
import { checkCompanyCode, provisionCompany } from '../actions';
import {
  billingStart,
  companyStep,
  CONTRACT_TYPES,
  contractStep,
  modulesStep,
  ownerStep,
  PAYMENT_METHODS,
  type ProvisionInput,
} from '../schema';
import { businessDateValue } from '../status';

export interface WizardCatalog {
  modules: (ModuleDef & { name: string })[];
  plans: { key: string; modules: string[]; name: string }[];
  companies: { id: string; code: string; display_name: string }[];
  /** Today in Asia/Tokyo, from the server. */
  today: string;
}

type ContractType = (typeof CONTRACT_TYPES)[number];
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

interface FormState {
  company: {
    legalName: string;
    legalNameKana: string;
    displayName: string;
    code: string;
    invoiceRegNo: string;
    postalCode: string;
    address: string;
    phone: string;
    email: string;
    referredBy: string;
  };
  modules: string[];
  contract: {
    type: ContractType | '';
    priceYen: string;
    paymentMethod: PaymentMethod | '';
    startsOn: string;
    trialDays: string;
  };
  owner: { name: string; email: string };
}

const STEP_KEYS = ['company', 'modules', 'contract', 'owner'] as const;
const CUSTOM_PLAN = 'custom';

// Error details from the database that belong to a field (ADR 0020).
const DETAIL_FIELDS: Record<string, [path: string, message: string]> = {
  company_code_taken: ['company.code', 'super.wizard.errors.codeTaken'],
  company_code_invalid: ['company.code', 'validation.companyCode'],
  billing_day_over_28: ['contract.startsOn', 'validation.billingDayOver28'],
  starts_on_in_the_past: ['contract.startsOn', 'validation.dateInPast'],
  module_has_dependents: ['modules', 'super.wizard.errors.modules'],
  module_requires_one_of: ['modules', 'super.wizard.errors.modules'],
  unknown_module: ['modules', 'super.wizard.errors.modules'],
};

function issuesToErrors(issues: z.core.$ZodIssue[], prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const path = [prefix, ...issue.path.map(String)].filter(Boolean).join('.');
    out[path] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
  }
  return out;
}

function stepOf(path: string): number {
  const index = STEP_KEYS.findIndex((key) => path === key || path.startsWith(`${key}.`));
  return index === -1 ? 0 : index;
}

function contractInput(c: FormState['contract']): ProvisionInput['contract'] {
  return {
    type: c.type as ContractType,
    priceYen: c.priceYen ? Number(c.priceYen) : undefined,
    paymentMethod: c.paymentMethod || undefined,
    startsOn: c.startsOn,
    trialDays: c.trialDays === '' ? 0 : Number(c.trialDays),
  };
}

export function CompanyWizard({ catalog }: { catalog: WizardCatalog }) {
  const t = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const [requestId] = useState(() => crypto.randomUUID());
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string; requestId: string }>();
  const [notice, setNotice] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const defaultPlan = catalog.plans.find((p) => p.key === 'standard') ?? catalog.plans[0];
  const [plan, setPlan] = useState(defaultPlan?.key ?? CUSTOM_PLAN);
  const [form, setForm] = useState<FormState>(() => ({
    company: {
      legalName: '',
      legalNameKana: '',
      displayName: '',
      code: '',
      invoiceRegNo: '',
      postalCode: '',
      address: '',
      phone: '',
      email: '',
      referredBy: '',
    },
    modules: defaultPlan ? modulesForPlan(defaultPlan.modules, catalog.modules) : [],
    contract: {
      type: '',
      priceYen: '',
      paymentMethod: '',
      startsOn: catalog.today,
      trialDays: '0',
    },
    owner: { name: '', email: '' },
  }));

  const codeCheck = useAction(checkCompanyCode);
  const provision = useAction(provisionCompany, { idempotent: true, toastOnError: false });

  // Moves focus to the new step's title, so screen readers and keyboards follow the wizard.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const moduleName = (key: string) => catalog.modules.find((m) => m.key === key)?.name ?? key;
  const list = (keys: string[]) => format.list(keys.map(moduleName), { type: 'conjunction' });
  const err = (path: string) => (errors[path] ? t(errors[path]) : undefined);
  const date = (value: string) =>
    format.dateTime(businessDateValue(value), { dateStyle: 'long', timeZone: 'UTC' });

  function setCompany(field: keyof FormState['company'], value: string) {
    setForm((f) => {
      const company = { ...f.company, [field]: value };
      if (!codeTouched && (field === 'legalName' || field === 'legalNameKana')) {
        company.code = suggestCompanyCode({
          legalName: company.legalName,
          kana: company.legalNameKana,
        });
      }
      return { ...f, company };
    });
  }
  const setContract = (field: keyof FormState['contract'], value: string) => {
    setForm((f) => ({ ...f, contract: { ...f.contract, [field]: value } }));
  };
  const setOwner = (field: keyof FormState['owner'], value: string) => {
    setForm((f) => ({ ...f, owner: { ...f.owner, [field]: value } }));
  };

  const matchingPlan = (modules: string[]) =>
    catalog.plans.find((p) => {
      const planModules = modulesForPlan(p.modules, catalog.modules);
      return planModules.length === modules.length && planModules.every((k) => modules.includes(k));
    })?.key ?? CUSTOM_PLAN;

  function choosePlan(key: string) {
    setPlan(key);
    const chosen = catalog.plans.find((p) => p.key === key);
    if (chosen) {
      setForm((f) => ({ ...f, modules: modulesForPlan(chosen.modules, catalog.modules) }));
      setNotice('');
    }
  }

  function toggleModule(key: string, on: boolean) {
    let modules: string[];
    if (on) {
      const result = enableModule(form.modules, key, catalog.modules);
      modules = result.selected;
      setNotice(
        result.added.length > 0
          ? t('super.wizard.modules.alsoEnabled', {
              module: moduleName(key),
              list: list(result.added),
            })
          : '',
      );
    } else {
      modules = form.modules.filter((k) => k !== key);
      setNotice('');
    }
    setForm((f) => ({ ...f, modules }));
    setPlan(matchingPlan(modules));
  }

  function validateStep(index: number): boolean {
    const schemas = [
      () => companyStep.safeParse(form.company),
      () => modulesStep.safeParse({ modules: form.modules }),
      () => contractStep.safeParse(contractInput(form.contract)),
      () => ownerStep.safeParse(form.owner),
    ] as const;
    const result = schemas[index]?.();
    let stepErrors =
      result && !result.success ? issuesToErrors(result.error.issues, STEP_KEYS[index] ?? '') : {};
    if (index === 1 && missingAnyDependency(form.modules, catalog.modules).length > 0) {
      stepErrors = { ...stepErrors, modules: 'super.wizard.errors.modules' };
    }
    if (index === 2 && form.contract.startsOn && form.contract.startsOn < catalog.today) {
      stepErrors = { 'contract.startsOn': 'validation.dateInPast', ...stepErrors };
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  async function next() {
    setFormError(undefined);
    if (!validateStep(step)) return;
    if (step === 0) {
      const result = await codeCheck.run({ code: form.company.code });
      if (!result.ok) return;
      if (!result.data.available) {
        setErrors({ 'company.code': 'super.wizard.errors.codeTaken' });
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEP_KEYS.length));
  }

  async function submit() {
    setFormError(undefined);
    for (let i = 0; i < STEP_KEYS.length; i += 1) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    const result = await provision.run({
      id: requestId,
      company: form.company,
      modules: form.modules,
      contract: contractInput(form.contract),
      owner: form.owner,
    });
    if (result.ok) {
      router.push(`/super/empresas?criada=${encodeURIComponent(result.data.code)}`);
      return;
    }
    const field = result.detail ? DETAIL_FIELDS[result.detail] : undefined;
    const fieldErrors = field ? { [field[0]]: field[1] } : (result.fieldErrors ?? {});
    const paths = Object.keys(fieldErrors);
    if (paths.length > 0) {
      setErrors(fieldErrors);
      setStep(Math.min(...paths.map(stepOf)));
      return;
    }
    setFormError({ message: t(result.message), requestId: result.requestId });
  }

  const contract = form.contract;
  const trialDays = contract.trialDays === '' ? 0 : Number(contract.trialDays);
  const paidStart =
    contract.startsOn && Number.isInteger(trialDays)
      ? billingStart(contract.startsOn, trialDays)
      : '';
  const suggestion = suggestCompanyCode({
    legalName: form.company.legalName,
    kana: form.company.legalNameKana,
  });
  const missingAny = missingAnyDependency(form.modules, catalog.modules);
  const isReview = step === STEP_KEYS.length - 1;
  const stepLabels = STEP_KEYS.map((key) => t(`super.wizard.steps.${key}`));

  return (
    <div className="flex flex-col gap-6">
      <Steps steps={stepLabels} current={step} label={t('super.wizard.progress')} />

      {formError ? (
        <Alert variant="danger" title={formError.message}>
          {t('errors.requestId', { id: formError.requestId })}
        </Alert>
      ) : null}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void (isReview ? submit() : next());
        }}
        className="flex flex-col gap-6"
      >
        <h2 ref={headingRef} tabIndex={-1} className="m-0 type-h2 outline-none">
          {t('super.wizard.stepTitle', {
            n: step + 1,
            total: STEP_KEYS.length,
            name: stepLabels[step] ?? '',
          })}
        </h2>

        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={t('super.wizard.company.legalName')}
              error={err('company.legalName')}
              required
              className="md:col-span-2"
            >
              <Input
                value={form.company.legalName}
                onChange={(e) => {
                  setCompany('legalName', e.target.value);
                }}
                maxLength={200}
                placeholder={t('super.wizard.company.legalNamePlaceholder')}
                autoComplete="organization"
              />
            </Field>
            <Field
              label={t('super.wizard.company.legalNameKana')}
              error={err('company.legalNameKana')}
              help={t('super.wizard.company.legalNameKanaHelp')}
            >
              <Input
                value={form.company.legalNameKana}
                onChange={(e) => {
                  setCompany('legalNameKana', e.target.value);
                }}
                maxLength={200}
                placeholder="カブシキガイシャ スギタコウギョウ"
              />
            </Field>
            <Field
              label={t('super.wizard.company.displayName')}
              error={err('company.displayName')}
              help={t('super.wizard.company.displayNameHelp')}
            >
              <Input
                value={form.company.displayName}
                onChange={(e) => {
                  setCompany('displayName', e.target.value);
                }}
                maxLength={100}
                placeholder={form.company.legalName}
              />
            </Field>
            <Field
              label={t('super.wizard.company.code')}
              error={err('company.code')}
              help={t('super.wizard.company.codeHelp')}
              required
            >
              <Input
                value={form.company.code}
                onChange={(e) => {
                  setCodeTouched(true);
                  setCompany('code', e.target.value.toUpperCase());
                }}
                maxLength={12}
                autoCapitalize="characters"
                spellCheck={false}
                className="type-num"
              />
            </Field>
            <div className="flex items-end pb-6">
              {codeTouched && suggestion && suggestion !== form.company.code ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCodeTouched(false);
                    setCompany('code', suggestion);
                  }}
                >
                  {t('super.wizard.company.useSuggestion', { code: suggestion })}
                </Button>
              ) : null}
            </div>
            <Field
              label={t('super.wizard.company.invoiceRegNo')}
              error={err('company.invoiceRegNo')}
              help={t('super.wizard.company.invoiceRegNoHelp')}
            >
              <Input
                value={form.company.invoiceRegNo}
                onChange={(e) => {
                  setCompany('invoiceRegNo', e.target.value);
                }}
                maxLength={16}
                placeholder="T1234567890123"
                className="type-num"
              />
            </Field>
            <Field
              label={t('super.wizard.company.referredBy')}
              error={err('company.referredBy')}
              help={t('super.wizard.company.referredByHelp')}
            >
              <NativeSelect
                value={form.company.referredBy}
                onChange={(e) => {
                  setCompany('referredBy', e.target.value);
                }}
              >
                <option value="">{t('super.wizard.company.referredByNone')}</option>
                {catalog.companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.display_name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t('super.wizard.company.postalCode')} error={err('company.postalCode')}>
              <PostalCodeInput
                value={form.company.postalCode}
                onChange={(e) => {
                  setCompany('postalCode', e.target.value);
                }}
              />
            </Field>
            <Field label={t('super.wizard.company.phone')} error={err('company.phone')}>
              <LandlinePhoneInput
                value={form.company.phone}
                onChange={(e) => {
                  setCompany('phone', e.target.value);
                }}
              />
            </Field>
            <Field
              label={t('super.wizard.company.address')}
              error={err('company.address')}
              className="md:col-span-2"
            >
              <Input
                value={form.company.address}
                onChange={(e) => {
                  setCompany('address', e.target.value);
                }}
                maxLength={300}
                autoComplete="street-address"
              />
            </Field>
            <Field
              label={t('super.wizard.company.email')}
              error={err('company.email')}
              help={t('super.wizard.company.emailHelp')}
            >
              <Input
                type="email"
                value={form.company.email}
                onChange={(e) => {
                  setCompany('email', e.target.value);
                }}
                maxLength={254}
                autoComplete="email"
              />
            </Field>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="type-label text-ink-muted">{t('super.wizard.modules.plan')}</span>
              <SegmentedControl
                label={t('super.wizard.modules.plan')}
                value={plan}
                onValueChange={choosePlan}
                options={[
                  ...catalog.plans.map((p) => ({ value: p.key, label: p.name })),
                  { value: CUSTOM_PLAN, label: t('super.wizard.modules.custom') },
                ]}
                className="self-start max-sm:flex-wrap"
              />
              <p className="m-0 text-xs text-ink-subtle">{t('super.wizard.modules.planHelp')}</p>
            </div>

            <p aria-live="polite" className="m-0 min-h-5 text-sm text-primary-text">
              {notice}
            </p>
            {err('modules') ? (
              <Alert variant="danger" title={err('modules')}>
                {missingAny
                  .map((m) =>
                    t('super.wizard.modules.needsOneOf', {
                      module: m.name,
                      list: format.list(m.depends_any.map(moduleName), { type: 'disjunction' }),
                    }),
                  )
                  .join(' ')}
              </Alert>
            ) : null}

            {(['base', 'optional', 'addon'] as const).map((kind) => (
              <fieldset
                key={kind}
                className="m-0 flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-5"
              >
                <legend className="px-1 type-label text-ink-muted">
                  {t(`super.wizard.modules.kinds.${kind}`)}
                </legend>
                <div className="grid gap-3 md:grid-cols-2">
                  {catalog.modules
                    .filter((m) => m.kind === kind)
                    .map((m) => {
                      const on = kind === 'base' || form.modules.includes(m.key);
                      const dependents =
                        on && kind !== 'base'
                          ? dependentsOf(m.key, form.modules, catalog.modules)
                          : [];
                      const description =
                        kind === 'base'
                          ? t('super.wizard.modules.always')
                          : dependents.length > 0
                            ? t('super.wizard.modules.requiredBy', { list: list(dependents) })
                            : m.depends_on.length > 0
                              ? t('super.wizard.modules.needs', { list: list(m.depends_on) })
                              : m.depends_any.length > 0
                                ? t('super.wizard.modules.needsAny', {
                                    list: format.list(m.depends_any.map(moduleName), {
                                      type: 'disjunction',
                                    }),
                                  })
                                : undefined;
                      return (
                        <Checkbox
                          key={m.key}
                          checked={on}
                          disabled={kind === 'base' || dependents.length > 0}
                          onCheckedChange={(checked) => {
                            toggleModule(m.key, checked === true);
                          }}
                          label={m.name}
                          description={description}
                        />
                      );
                    })}
                </div>
              </fieldset>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-5">
            <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
              <legend className="mb-2 type-label text-ink-muted">
                {t('super.wizard.contract.type')}
                <span aria-hidden className="ml-0.5 text-danger">
                  *
                </span>
              </legend>
              <RadioGroup
                value={contract.type}
                onValueChange={(v) => {
                  setContract('type', v);
                }}
                aria-invalid={errors['contract.type'] ? true : undefined}
              >
                {CONTRACT_TYPES.map((type) => (
                  <Radio
                    key={type}
                    value={type}
                    label={t(`super.contractType.${type}`)}
                    description={t(`super.wizard.contract.typeHelp.${type}`)}
                  />
                ))}
              </RadioGroup>
              {err('contract.type') ? (
                <p className="m-0 text-xs text-danger">{err('contract.type')}</p>
              ) : null}
            </fieldset>

            {contract.type === 'partner' ? (
              <Alert variant="info" title={t('super.wizard.contract.partnerTitle')}>
                {t('super.wizard.contract.partnerText')}
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {contract.type !== 'partner' ? (
                <>
                  <Field
                    label={t('super.wizard.contract.price')}
                    error={err('contract.priceYen')}
                    help={t(
                      `super.wizard.contract.priceHelp.${contract.type === 'annual' ? 'annual' : 'monthly'}`,
                    )}
                    required
                  >
                    <Input
                      inputMode="numeric"
                      value={
                        contract.priceYen ? Number(contract.priceYen).toLocaleString('ja-JP') : ''
                      }
                      onChange={(e) => {
                        setContract('priceYen', digitsOnly(e.target.value).slice(0, 12));
                      }}
                      suffix="円"
                      className="type-num"
                    />
                  </Field>
                  <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
                    <legend className="mb-1.5 type-label text-ink-muted">
                      {t('super.wizard.contract.paymentMethod')}
                      <span aria-hidden className="ml-0.5 text-danger">
                        *
                      </span>
                    </legend>
                    <RadioGroup
                      value={contract.paymentMethod}
                      onValueChange={(v) => {
                        setContract('paymentMethod', v);
                      }}
                      className="flex-row gap-5"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <Radio key={m} value={m} label={t(`super.paymentMethod.${m}`)} />
                      ))}
                    </RadioGroup>
                    {err('contract.paymentMethod') ? (
                      <p className="m-0 text-xs text-danger">{err('contract.paymentMethod')}</p>
                    ) : null}
                  </fieldset>
                </>
              ) : null}
              <Field
                label={t('super.wizard.contract.startsOn')}
                error={err('contract.startsOn')}
                required
              >
                <Input
                  type="date"
                  min={catalog.today}
                  value={contract.startsOn}
                  onChange={(e) => {
                    setContract('startsOn', e.target.value);
                  }}
                />
              </Field>
              {contract.type !== 'partner' ? (
                <Field
                  label={t('super.wizard.contract.trialDays')}
                  error={err('contract.trialDays')}
                  help={t('super.wizard.contract.trialDaysHelp')}
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={90}
                    value={contract.trialDays}
                    onChange={(e) => {
                      setContract('trialDays', digitsOnly(e.target.value).slice(0, 2));
                    }}
                    suffix={t('super.wizard.contract.days')}
                    className="type-num"
                  />
                </Field>
              ) : null}
            </div>

            {contract.type && contract.type !== 'partner' && paidStart ? (
              <CardInset className="flex flex-col gap-1 text-sm">
                {trialDays > 0 ? (
                  <p className="m-0">
                    {t('super.wizard.contract.trialUntil', {
                      date: date(billingStart(contract.startsOn, trialDays - 1)),
                    })}
                  </p>
                ) : null}
                <p className="m-0">
                  {contract.type === 'monthly'
                    ? t('super.wizard.contract.billingMonthly', {
                        day: Number(paidStart.slice(8)),
                        date: date(paidStart),
                      })
                    : t('super.wizard.contract.billingAnnual', { date: date(paidStart) })}
                </p>
              </CardInset>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('super.wizard.owner.name')} error={err('owner.name')} required>
                <Input
                  value={form.owner.name}
                  onChange={(e) => {
                    setOwner('name', e.target.value);
                  }}
                  maxLength={100}
                  autoComplete="off"
                />
              </Field>
              <Field
                label={t('super.wizard.owner.email')}
                error={err('owner.email')}
                help={t('super.wizard.owner.emailHelp')}
                required
              >
                <Input
                  type="email"
                  value={form.owner.email}
                  onChange={(e) => {
                    setOwner('email', e.target.value);
                  }}
                  maxLength={254}
                  autoComplete="off"
                />
              </Field>
            </div>

            <h3 className="m-0 type-h3">{t('super.wizard.review.title')}</h3>
            <div className="grid gap-4 lg:grid-cols-3">
              <ReviewCard
                title={t('super.wizard.steps.company')}
                edit={t('super.wizard.review.edit')}
                onEdit={() => {
                  setStep(0);
                }}
              >
                <ReviewItem label={t('super.wizard.company.legalName')}>
                  {form.company.legalName}
                </ReviewItem>
                <ReviewItem label={t('super.wizard.company.code')}>
                  <span className="type-num">{form.company.code}</span>
                </ReviewItem>
                {form.company.displayName ? (
                  <ReviewItem label={t('super.wizard.company.displayName')}>
                    {form.company.displayName}
                  </ReviewItem>
                ) : null}
                {form.company.postalCode || form.company.address ? (
                  <ReviewItem label={t('super.wizard.company.address')}>
                    {[
                      form.company.postalCode
                        ? `〒${formatPostalCode(form.company.postalCode)}`
                        : '',
                      form.company.address,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </ReviewItem>
                ) : null}
                {form.company.phone ? (
                  <ReviewItem label={t('super.wizard.company.phone')}>
                    {formatLandlinePhone(form.company.phone)}
                  </ReviewItem>
                ) : null}
                {form.company.referredBy ? (
                  <ReviewItem label={t('super.wizard.company.referredBy')}>
                    {catalog.companies.find((c) => c.id === form.company.referredBy)?.display_name}
                  </ReviewItem>
                ) : null}
              </ReviewCard>
              <ReviewCard
                title={t('super.wizard.steps.modules')}
                edit={t('super.wizard.review.edit')}
                onEdit={() => {
                  setStep(1);
                }}
              >
                <ReviewItem label={t('super.wizard.modules.plan')}>
                  {catalog.plans.find((p) => p.key === plan)?.name ??
                    t('super.wizard.modules.custom')}
                </ReviewItem>
                <ReviewItem
                  label={t('super.wizard.review.modules', { count: form.modules.length })}
                >
                  <span className="flex flex-wrap gap-1.5 pt-1">
                    {form.modules.length > 0
                      ? form.modules.map((k) => <Badge key={k}>{moduleName(k)}</Badge>)
                      : t('super.wizard.review.baseOnly')}
                  </span>
                </ReviewItem>
              </ReviewCard>
              <ReviewCard
                title={t('super.wizard.steps.contract')}
                edit={t('super.wizard.review.edit')}
                onEdit={() => {
                  setStep(2);
                }}
              >
                {contract.type ? (
                  <ReviewItem label={t('super.wizard.contract.type')}>
                    {t(`super.contractType.${contract.type}`)}
                  </ReviewItem>
                ) : null}
                {contract.type && contract.type !== 'partner' ? (
                  <>
                    <ReviewItem label={t('super.wizard.contract.price')}>
                      <span className="type-num">
                        {contract.priceYen ? formatYen(Number(contract.priceYen)) : '—'}
                      </span>
                    </ReviewItem>
                    {contract.paymentMethod ? (
                      <ReviewItem label={t('super.wizard.contract.paymentMethod')}>
                        {t(`super.paymentMethod.${contract.paymentMethod}`)}
                      </ReviewItem>
                    ) : null}
                  </>
                ) : null}
                {contract.startsOn ? (
                  <ReviewItem label={t('super.wizard.contract.startsOn')}>
                    {date(contract.startsOn)}
                  </ReviewItem>
                ) : null}
                {contract.type !== 'partner' && trialDays > 0 ? (
                  <ReviewItem label={t('super.wizard.contract.trialDays')}>
                    {t('super.wizard.review.trial', { days: trialDays })}
                  </ReviewItem>
                ) : null}
              </ReviewCard>
            </div>
            <Alert variant="info" title={t('super.wizard.review.inviteTitle')}>
              {t('super.wizard.review.inviteText')}
            </Alert>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setErrors({});
                setFormError(undefined);
                setStep((s) => s - 1);
              }}
            >
              <ArrowLeft aria-hidden />
              {t('super.wizard.back')}
            </Button>
          ) : (
            <span />
          )}
          {isReview ? (
            <Button type="submit" variant="primary" loading={provision.pending}>
              <Building2 aria-hidden />
              {provision.pending ? t('super.wizard.creating') : t('super.wizard.create')}
            </Button>
          ) : (
            <Button type="submit" variant="primary" loading={codeCheck.pending}>
              {t('super.wizard.next')}
              <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewCard({
  title,
  edit,
  onEdit,
  children,
}: {
  title: string;
  edit: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <Check aria-hidden className="size-4 text-success" />
        <CardTitle>{title}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label={`${edit}: ${title}`}
        >
          <Pencil aria-hidden />
          {edit}
        </Button>
      </CardHeader>
      <dl className="m-0 flex flex-col gap-2.5">{children}</dl>
    </Card>
  );
}

function ReviewItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="m-0 text-sm break-words">{children}</dd>
    </div>
  );
}
