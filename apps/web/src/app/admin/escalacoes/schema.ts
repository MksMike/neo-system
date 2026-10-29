import { addDays, businessDate, freeText, longText, optional } from '@neo/validation';
import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'validation.time');

/** ISO weekdays: 1 = Monday ... 7 = Sunday. */
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export const assignmentSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().min(1).optional(),
    clientId: z.uuid('validation.required'),
    chainId: z.union([z.literal(''), z.uuid()]),
    siteId: z.union([z.literal(''), z.uuid()]),
    title: optional(freeText({ max: 120 })),
    startsOn: businessDate,
    endsOn: businessDate,
    startTime: time,
    endTime: time,
    breakMinutes: z
      .number()
      .int('validation.integer')
      .min(0, 'validation.min')
      .max(480, 'validation.max'),
    workDays: z.array(z.number().int().min(1).max(7)).min(1, 'validation.required').max(7),
    meetingPlace: optional(freeText({ max: 200 })),
    meetingTime: z.union([z.literal(''), time]),
    note: optional(longText({ max: 1000 })),
  })
  .superRefine((v, ctx) => {
    if (v.endsOn < v.startsOn) {
      ctx.addIssue({ code: 'custom', path: ['endsOn'], message: 'validation.endBeforeStart' });
    } else if (addDays(v.startsOn, 366) < v.endsOn) {
      ctx.addIssue({ code: 'custom', path: ['endsOn'], message: 'validation.periodTooLong' });
    }
    if (v.startTime === v.endTime) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'validation.invalid' });
    }
  });
export type AssignmentInput = z.input<typeof assignmentSchema>;

export const memberSchema = z.object({
  id: z.uuid(),
  assignmentId: z.uuid(),
  employeeId: z.uuid('validation.required'),
  startsOn: z.union([z.literal(''), businessDate]),
  endsOn: z.union([z.literal(''), businessDate]),
});

/** Business days planned in a period for the given weekdays (shown on the form). */
export function plannedDays(startsOn: string, endsOn: string, workDays: number[]): number {
  if (!startsOn || !endsOn || endsOn < startsOn) return 0;
  let count = 0;
  for (let day = startsOn; day <= endsOn; day = addDays(day, 1)) {
    const iso = ((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;
    if (workDays.includes(iso)) count += 1;
  }
  return count;
}

/** `08:00` from a database time (`08:00:00`). */
export function shortTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : '';
}
