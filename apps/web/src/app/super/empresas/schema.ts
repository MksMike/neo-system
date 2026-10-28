import {
  addDays,
  businessDate,
  companyCode,
  email,
  freeText,
  invoiceRegNo,
  kanaText,
  landlinePhone,
  longText,
  optional,
  postalCode,
  yen,
} from '@neo/validation';
import { z } from 'zod';

/** Fields of each wizard step, so a step can be validated alone (layer 00, section 5). */
export const companyStep = z.object({
  legalName: freeText({ min: 1, max: 200 }),
  legalNameKana: optional(kanaText({ max: 200 })),
  displayName: optional(freeText({ max: 100 })),
  code: companyCode,
  invoiceRegNo: optional(invoiceRegNo),
  postalCode: optional(postalCode),
  address: optional(freeText({ max: 300 })),
  phone: optional(landlinePhone),
  email: optional(email),
  referredBy: z.union([z.literal(''), z.uuid()]),
});

export const modulesStep = z.object({
  modules: z.array(z.string().regex(/^[a-z_]{2,30}$/)).max(30),
});

export const CONTRACT_TYPES = ['monthly', 'annual', 'partner'] as const;
export const PAYMENT_METHODS = ['transfer', 'cash'] as const;

/** First day of the first paid period (R00-14, R00-17): the day after the trial, or the start. */
export function billingStart(startsOn: string, trialDays: number): string {
  return trialDays > 0 ? addDays(startsOn, trialDays) : startsOn;
}

/** Suggested contract start: today, or the 1st of next month on days 29 to 31 (R00-14). */
export function suggestedStart(today: string): string {
  if (Number(today.slice(8)) <= 28) return today;
  const [y, m] = today.split('-').map(Number) as [number, number];
  return m === 12 ? `${String(y + 1)}-01-01` : `${String(y)}-${String(m + 1).padStart(2, '0')}-01`;
}

export const contractStep = z
  .object({
    type: z.enum(CONTRACT_TYPES, 'validation.required'),
    priceYen: yen.optional(),
    paymentMethod: z.enum(PAYMENT_METHODS, 'validation.required').optional(),
    startsOn: businessDate,
    trialDays: z
      .number()
      .int('validation.integer')
      .min(0, 'validation.min')
      .max(90, 'validation.max'),
  })
  .superRefine((c, ctx) => {
    if (c.type === 'partner') return; // R00-12: no price, no charges
    if (!c.priceYen) {
      ctx.addIssue({ code: 'custom', path: ['priceYen'], message: 'validation.required' });
    }
    if (!c.paymentMethod) {
      ctx.addIssue({ code: 'custom', path: ['paymentMethod'], message: 'validation.required' });
    }
    if (Number(billingStart(c.startsOn, c.trialDays).slice(8)) > 28) {
      ctx.addIssue({ code: 'custom', path: ['startsOn'], message: 'validation.billingDayOver28' });
    }
  });

export const ownerStep = z.object({
  name: freeText({ min: 1, max: 100 }),
  email,
});

/** The whole request. `id` is generated on the screen: a retry never creates a second company. */
export const provisionSchema = z.object({
  id: z.uuid(),
  company: companyStep,
  modules: modulesStep.shape.modules,
  contract: contractStep,
  owner: ownerStep,
});

export type ProvisionInput = z.input<typeof provisionSchema>;
export type ProvisionData = z.output<typeof provisionSchema>;

/**
 * First day of the paid cycle of a new contract version (R00-14): a paid contract keeps the
 * cycle of the previous paid one (from its paid-until or the change date, whichever is later);
 * otherwise it starts on the change date. Same rule as `app.build_contract`.
 */
export function nextBillingStart(
  previous: { type: string; paid_until: string | null } | null,
  validFrom: string,
): string {
  if (previous && previous.type !== 'partner' && previous.paid_until) {
    const afterPaid = addDays(previous.paid_until, 1);
    return afterPaid > validFrom ? afterPaid : validFrom;
  }
  return validFrom;
}

/** Contract change with an effective date (R00-05). No trial: it only exists in the first contract. */
export const contractChangeSchema = z
  .object({
    companyId: z.uuid(),
    expectedContractId: z.uuid().nullable(),
    type: z.enum(CONTRACT_TYPES, 'validation.required'),
    priceYen: yen.optional(),
    paymentMethod: z.enum(PAYMENT_METHODS, 'validation.required').optional(),
    validFrom: businessDate,
    note: optional(longText({ max: 500 })),
  })
  .superRefine((c, ctx) => {
    if (c.type === 'partner') return;
    if (!c.priceYen) {
      ctx.addIssue({ code: 'custom', path: ['priceYen'], message: 'validation.required' });
    }
    if (!c.paymentMethod) {
      ctx.addIssue({ code: 'custom', path: ['paymentMethod'], message: 'validation.required' });
    }
  });

export const modulesChangeSchema = z.object({
  companyId: z.uuid(),
  modules: modulesStep.shape.modules,
  expected: modulesStep.shape.modules,
  validFrom: businessDate,
});
