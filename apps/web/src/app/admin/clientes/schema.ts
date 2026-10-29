import {
  email,
  freeText,
  invoiceRegNo,
  kanaText,
  landlinePhone,
  longText,
  optional,
  postalCode,
} from '@neo/validation';
import { z } from 'zod';

/** Colors of the client chain: design tokens (day-type colors, light and dark), by name (R04-03). */
export const CHAIN_COLORS = [
  'teiji',
  'yukyu',
  'zangyo',
  'chushi',
  'hannichi',
  'pending',
  'kekkin',
  'kyugyo',
  'yasumi',
] as const;
export type ChainColor = (typeof CHAIN_COLORS)[number];

/** CSS color of a chain color in the active theme. */
export function chainColorVar(color: string): string {
  return `var(--day-${color})`;
}

const version = z.number().int().min(1).optional();

export const organizationSchema = z.object({
  id: z.uuid(),
  version,
  name: freeText({ min: 1, max: 200 }),
  nameKana: optional(kanaText({ max: 200 })),
  isClient: z.boolean(),
  postalCode: optional(postalCode),
  address: optional(freeText({ max: 300 })),
  phone: optional(landlinePhone),
  email: optional(email),
  invoiceRegNo: optional(invoiceRegNo),
  note: optional(longText({ max: 1000 })),
});
export type OrganizationInput = z.input<typeof organizationSchema>;

export const linkSchema = z
  .object({
    id: z.uuid(),
    clientId: z.uuid(),
    organizationId: z.uuid().optional(),
    newOrganizationId: z.uuid().optional(),
    name: optional(freeText({ max: 200 })),
    position: z.number().int().min(1, 'validation.min').max(9, 'validation.max'),
    abbreviation: optional(freeText({ max: 6 })),
  })
  .refine((v) => v.organizationId ?? v.name, { message: 'validation.required', path: ['name'] });

export const chainUpdateSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1),
  color: z.enum(CHAIN_COLORS).optional(),
  abbreviation: optional(freeText({ min: 1, max: 6 })),
  position: z.number().int().min(1).max(9).optional(),
  removed: z.boolean().optional(),
});

export const siteSchema = z.object({
  id: z.uuid(),
  version,
  clientId: z.union([z.literal(''), z.uuid()]),
  name: freeText({ min: 1, max: 200 }),
  postalCode: optional(postalCode),
  address: optional(freeText({ max: 300 })),
  radiusM: z
    .number()
    .int('validation.integer')
    .min(50, 'validation.min')
    .max(5000, 'validation.max'),
  note: optional(longText({ max: 1000 })),
});
export type SiteInput = z.input<typeof siteSchema>;
