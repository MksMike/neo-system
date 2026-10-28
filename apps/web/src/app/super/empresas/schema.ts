import {
  addDays,
  businessDate,
  companyCode,
  email,
  freeText,
  invoiceRegNo,
  kanaText,
  landlinePhone,
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
