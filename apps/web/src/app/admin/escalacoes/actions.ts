'use server';

import { z } from 'zod';
import { defineAction } from '@/server/define-action';
import { officeForAction } from '@/server/office';
import { userClient } from '@/server/session';
import { addEmployeeSchema, assignmentSchema, daySchema } from './schema';

/** Creates (id from the screen, safe to retry) or edits (with `version`) an assignment. */
export const saveAssignment = defineAction({
  name: 'assignment.save',
  schema: assignmentSchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { data, error } = await supabase.rpc('save_assignment', {
      p: {
        id: input.id,
        company_id: office.companyId,
        ...(input.version ? { version: input.version } : {}),
        client_id: input.clientId,
        chain_id: input.chainId || null,
        site_id: input.siteId || null,
        title: input.title ?? null,
        title_show_on: input.titleShowOn,
        starts_on: input.startsOn,
        ends_on: input.endsOn,
        start_time: input.startTime,
        end_time: input.endTime,
        break_minutes: input.breakMinutes,
        meeting_place: input.meetingPlace ?? null,
        meeting_time: input.meetingTime || null,
        day_rate: input.dayRate,
        tax_rate: input.taxRate,
        price_includes_tax: input.priceIncludesTax,
        extra_description: input.extraDescription ?? null,
        extra_client_amount: input.extraClientAmount,
        extra_employee_amount: input.extraEmployeeAmount,
        extra_client_taxable: input.extraClientTaxable,
        note: input.note ?? null,
      },
    });
    if (error) throw error;
    return { id: (data as { id: string }).id };
  },
});

/** Deletes an assignment and its days (logical deletion). */
export const deleteAssignment = defineAction({
  name: 'assignment.delete',
  schema: z.object({ id: z.uuid(), version: z.number().int().min(1) }),
  handler: async ({ id, version }) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { error } = await supabase.rpc('delete_assignment', {
      p_company_id: office.companyId,
      p_id: id,
      p_version: version,
    });
    if (error) throw error;
    return { id };
  },
});

/** Puts an employee on the whole period or on some days; days already there are kept (R06-07). */
export const addEmployee = defineAction({
  name: 'assignment.add_employee',
  schema: addEmployeeSchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { data, error } = await supabase.rpc('add_assignment_employee', {
      p: {
        company_id: office.companyId,
        assignment_id: input.assignmentId,
        employee_id: input.employeeId,
        starts_on: input.startsOn || null,
        ends_on: input.endsOn || null,
      },
    });
    if (error) throw error;
    return { added: data };
  },
});

/** Edits one day of one employee (R06-08), with `version`. */
export const saveDay = defineAction({
  name: 'assignment.save_day',
  schema: daySchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { error } = await supabase.rpc('save_assignment_day', {
      p: {
        id: input.id,
        company_id: office.companyId,
        version: input.version,
        status: input.status,
        period: input.period,
        start_time: input.startTime,
        end_time: input.endTime,
        break_minutes: input.breakMinutes,
        worked_minutes: input.workedMinutes,
        overtime_minutes: input.overtimeMinutes,
        chain_id: input.chainId || null,
        site_id: input.siteId || null,
        day_rate: input.dayRate,
        tax_rate: input.taxRate,
        price_includes_tax: input.priceIncludesTax,
        meeting_place: input.meetingPlace ?? null,
        meeting_time: input.meetingTime || null,
        client_extra_description: input.clientExtraDescription ?? null,
        client_extra_amount: input.clientExtraAmount,
        client_extra_taxable: input.clientExtraTaxable,
        employee_extra_description: input.employeeExtraDescription ?? null,
        employee_extra_amount: input.employeeExtraAmount,
        fine_description: input.fineDescription ?? null,
        fine_amount: input.fineAmount,
        note: input.note ?? null,
      },
    });
    if (error) throw error;
    return { id: input.id };
  },
});

/** "Todos teiji" / "Todos folga" of one day of an assignment. */
export const setDayStatus = defineAction({
  name: 'assignment.set_day_status',
  schema: z.object({
    assignmentId: z.uuid(),
    day: z.iso.date(),
    status: z.enum(['teiji', 'off']),
  }),
  handler: async ({ assignmentId, day, status }) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { data, error } = await supabase.rpc('set_assignment_day_status', {
      p_company_id: office.companyId,
      p_assignment_id: assignmentId,
      p_day: day,
      p_status: status,
    });
    if (error) throw error;
    return { changed: data };
  },
});

/** Removes one day of an employee, or all of their days in the assignment (logical deletion). */
export const removeEmployee = defineAction({
  name: 'assignment.remove_employee',
  schema: z.object({
    assignmentId: z.uuid(),
    employeeId: z.uuid(),
    dayId: z.uuid().optional(),
  }),
  handler: async ({ assignmentId, employeeId, dayId }) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { error } = await supabase.rpc('remove_assignment_employee', {
      p_company_id: office.companyId,
      p_assignment_id: assignmentId,
      p_employee_id: employeeId,
      ...(dayId ? { p_day_id: dayId } : {}),
    });
    if (error) throw error;
    return { employeeId };
  },
});
