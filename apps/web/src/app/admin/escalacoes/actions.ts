'use server';

import { z } from 'zod';
import { defineAction } from '@/server/define-action';
import { officeForAction } from '@/server/office';
import { userClient } from '@/server/session';
import { assignmentSchema, memberSchema } from './schema';

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
        starts_on: input.startsOn,
        ends_on: input.endsOn,
        start_time: input.startTime,
        end_time: input.endTime,
        break_minutes: input.breakMinutes,
        work_days: input.workDays,
        meeting_place: input.meetingPlace ?? null,
        meeting_time: input.meetingTime || null,
        note: input.note ?? null,
      },
    });
    if (error) throw error;
    return { id: (data as { id: string }).id };
  },
});

/** Allocates an employee for the whole period or an interval (R06-02 refuses overlapping hours). */
export const addMember = defineAction({
  name: 'assignment.add_member',
  schema: memberSchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { error } = await supabase.rpc('add_assignment_member', {
      p: {
        id: input.id,
        company_id: office.companyId,
        assignment_id: input.assignmentId,
        employee_id: input.employeeId,
        starts_on: input.startsOn || null,
        ends_on: input.endsOn || null,
      },
    });
    if (error) throw error;
    return { id: input.id };
  },
});

/** Removes an allocation (logical deletion). */
export const removeMember = defineAction({
  name: 'assignment.remove_member',
  schema: z.object({ memberId: z.uuid(), version: z.number().int().min(1) }),
  handler: async ({ memberId, version }) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { error } = await supabase.rpc('remove_assignment_member', {
      p_company_id: office.companyId,
      p_member_id: memberId,
      p_version: version,
    });
    if (error) throw error;
    return { id: memberId };
  },
});
