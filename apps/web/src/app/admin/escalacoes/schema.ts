import { addDays, businessDate, freeText, longText, optional, yen } from '@neo/validation';
import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'validation.time');
const amount = yen.max(1_000_000, 'validation.max');
const dayRate = yen.max(10_000_000, 'validation.max');
const taxRate = z.union([z.literal(0), z.literal(8), z.literal(10)]);
const minutes = z
  .number()
  .int('validation.integer')
  .min(0, 'validation.min')
  .max(1440, 'validation.max');

export const TAX_RATES = [10, 8, 0] as const;
export const TITLE_SHOW_ON = ['both', 'invoice', 'timesheet'] as const;
/** 定時, 半日, 残業, 早出, 夜勤, por hora. */
export const PERIODS = ['teiji', 'hannichi', 'zangyo', 'hayade', 'yakin', 'hourly'] as const;
export type Period = (typeof PERIODS)[number];
export type DayStatus = 'pending' | 'work' | 'off';

/** R06-06: an assignment is one closed month, at most 31 days. */
export const MAX_PERIOD_DAYS = 31;

export const assignmentSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().min(1).optional(),
    clientId: z.uuid('validation.required'),
    chainId: z.union([z.literal(''), z.uuid()]),
    siteId: z.union([z.literal(''), z.uuid()]),
    title: optional(freeText({ max: 120 })),
    titleShowOn: z.enum(TITLE_SHOW_ON),
    startsOn: businessDate,
    endsOn: businessDate,
    startTime: time,
    endTime: time,
    breakMinutes: z
      .number()
      .int('validation.integer')
      .min(0, 'validation.min')
      .max(480, 'validation.max'),
    meetingPlace: optional(freeText({ max: 200 })),
    meetingTime: z.union([z.literal(''), time]),
    dayRate,
    taxRate,
    priceIncludesTax: z.boolean(),
    extraDescription: optional(freeText({ max: 60 })),
    extraClientAmount: amount,
    extraEmployeeAmount: amount,
    extraClientTaxable: z.boolean(),
    note: optional(longText({ max: 1000 })),
  })
  .superRefine((v, ctx) => {
    if (v.endsOn < v.startsOn) {
      ctx.addIssue({ code: 'custom', path: ['endsOn'], message: 'validation.endBeforeStart' });
    } else if (addDays(v.startsOn, MAX_PERIOD_DAYS - 1) < v.endsOn) {
      ctx.addIssue({ code: 'custom', path: ['endsOn'], message: 'validation.periodTooLong' });
    }
    if (v.startTime === v.endTime) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'validation.invalid' });
    }
  });
export type AssignmentInput = z.input<typeof assignmentSchema>;

/** Puts an employee on the whole period (no dates) or on a range of days. */
export const addEmployeeSchema = z.object({
  assignmentId: z.uuid(),
  employeeId: z.uuid('validation.required'),
  startsOn: z.union([z.literal(''), businessDate]),
  endsOn: z.union([z.literal(''), businessDate]),
});

export const daySchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().min(1),
    status: z.enum(['pending', 'work', 'off']),
    period: z.enum(PERIODS),
    startTime: time,
    endTime: time,
    breakMinutes: minutes.max(480, 'validation.max'),
    workedMinutes: minutes,
    overtimeMinutes: minutes,
    chainId: z.union([z.literal(''), z.uuid()]),
    siteId: z.union([z.literal(''), z.uuid()]),
    dayRate,
    taxRate,
    priceIncludesTax: z.boolean(),
    meetingPlace: optional(freeText({ max: 200 })),
    meetingTime: z.union([z.literal(''), time]),
    clientExtraDescription: optional(freeText({ max: 60 })),
    clientExtraAmount: amount,
    clientExtraTaxable: z.boolean(),
    employeeExtraDescription: optional(freeText({ max: 60 })),
    employeeExtraAmount: amount,
    fineDescription: optional(freeText({ max: 60 })),
    fineAmount: amount,
    note: optional(longText({ max: 500 })),
  })
  .superRefine((v, ctx) => {
    if (v.startTime === v.endTime) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'validation.invalid' });
    }
  });
export type DayInput = z.input<typeof daySchema>;

/** Panel 2: what a bulk edit changes; absent keys stay as they are (R06-11). */
export const bulkSetSchema = z
  .object({
    status: z.enum(['pending', 'work', 'off']).optional(),
    period: z.enum(PERIODS).optional(),
    overtimeMinutes: minutes.optional(),
    chainId: z.union([z.literal(''), z.uuid()]).optional(),
    siteId: z.union([z.literal(''), z.uuid()]).optional(),
    dayRate: dayRate.optional(),
    taxRate: taxRate.optional(),
    priceIncludesTax: z.boolean().optional(),
    clientExtra: z
      .object({ description: optional(freeText({ max: 60 })), amount, taxable: z.boolean() })
      .optional(),
    employeeExtra: z.object({ description: optional(freeText({ max: 60 })), amount }).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'validation.required');
export type BulkSet = z.input<typeof bulkSetSchema>;

/** Days of a period, inclusive. */
export function periodDays(startsOn: string, endsOn: string): string[] {
  const days: string[] = [];
  if (!startsOn || !endsOn || endsOn < startsOn) return days;
  for (let d = startsOn; d <= endsOn && days.length < 62; d = addDays(d, 1)) days.push(d);
  return days;
}

/** `08:00` from a database time (`08:00:00`). */
export function shortTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : '';
}

/** `1.5` from 90 minutes. */
export function hoursOf(value: number): string {
  return (value / 60).toFixed(1);
}
