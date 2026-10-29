import { businessDate, freeText, kanaText, longText, mobilePhone, optional } from '@neo/validation';
import { z } from 'zod';

/** 社員, パート, 下請, 業務委託 (docs/00-ancora.md, glossary "Vínculo"). */
export const EMPLOYMENT_TYPES = ['regular', 'part_time', 'subcontractor', 'freelancer'] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/** Nationalities offered first (most common in genba teams); stored as ISO 3166-1 alpha-2. */
export const NATIONALITIES = [
  'JP',
  'BR',
  'VN',
  'PH',
  'ID',
  'NP',
  'CN',
  'PE',
  'BO',
  'PY',
  'AR',
  'KR',
  'TH',
  'MM',
  'LK',
  'US',
] as const;

export const employeeSchema = z.object({
  id: z.uuid(),
  version: z.number().int().min(1).optional(),
  fullName: freeText({ min: 1, max: 100 }),
  nameKana: optional(kanaText({ max: 100 })),
  employmentType: z.enum(EMPLOYMENT_TYPES, 'validation.required'),
  nationality: z.union([z.literal(''), z.string().regex(/^[A-Z]{2}$/)]),
  mobilePhone: optional(mobilePhone),
  hireDate: z.union([z.literal(''), businessDate]),
  status: z.enum(['active', 'inactive']).optional(),
  note: optional(longText({ max: 1000 })),
});
export type EmployeeInput = z.input<typeof employeeSchema>;

/** `4821-7305`: the ID shown in two blocks (ADR 0016). */
export function formatLoginId(id: string): string {
  return id.length === 8 ? `${id.slice(0, 4)}-${id.slice(4)}` : id;
}
