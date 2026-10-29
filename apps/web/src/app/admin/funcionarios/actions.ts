'use server';

import { ActionError } from '@neo/db';
import { createAdminClient } from '@neo/db/server';
import { z } from 'zod';
import { derivePassword, generateLoginId, generatePin, technicalEmail } from '@/lib/pin-login';
import { defineAction } from '@/server/define-action';
import { officeForAction } from '@/server/office';
import { userClient } from '@/server/session';
import { employeeSchema } from './schema';

/** Creates (id from the screen, safe to retry) or edits (with `version`) an employee. */
export const saveEmployee = defineAction({
  name: 'employee.save',
  schema: employeeSchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { data, error } = await supabase.rpc('save_employee', {
      p: {
        id: input.id,
        company_id: office.companyId,
        ...(input.version ? { version: input.version } : {}),
        full_name: input.fullName,
        name_kana: input.nameKana ?? null,
        employment_type: input.employmentType,
        nationality: input.nationality || null,
        mobile_phone: input.mobilePhone ?? null,
        hire_date: input.hireDate || null,
        status: input.status ?? null,
        note: input.note ?? null,
      },
    });
    if (error) throw error;
    return { id: (data as { id: string }).id };
  },
});

function pepper(): string {
  const value = process.env.PIN_PEPPER;
  if (!value)
    throw new Error('Missing environment variable PIN_PEPPER (see apps/web/.env.example)');
  return value;
}

/**
 * Creates the app access of an employee (8-digit ID + PIN) or resets the PIN (ADR 0016).
 * The PIN is returned once, to be handed to the employee; it is never stored or logged.
 * Step 1 checks the right as the signed-in user; the technical login needs the secret key and
 * runs only here, on the server; step 2 links it, filtering the company explicitly.
 */
export const createEmployeeAccess = defineAction({
  name: 'employee.access',
  schema: z.object({ employeeId: z.uuid() }),
  handler: async ({ employeeId }, ctx) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { data: begun, error: beginError } = await supabase.rpc('begin_employee_access', {
      p_company_id: office.companyId,
      p_employee_id: employeeId,
    });
    if (beginError) throw beginError;
    const current = begun as { user_id: string | null; login_id: string | null };

    const admin = createAdminClient();
    const pin = generatePin();

    if (current.user_id && current.login_id) {
      // Reset: new PIN, and every session of that login ends (step 2 with reset).
      const { error } = await admin.auth.admin.updateUserById(current.user_id, {
        password: derivePassword(current.login_id, pin, pepper()),
      });
      if (error) throw error;
      const { error: finishError } = await admin.rpc('finish_employee_access', {
        p_company_id: office.companyId,
        p_employee_id: employeeId,
        p_user_id: current.user_id,
        p_login_id: current.login_id,
        p_reset: true,
      });
      if (finishError) throw finishError;
      ctx.log('AUTH.PIN.RESET');
      return { loginId: current.login_id, pin, reset: true };
    }

    // New access: a random ID; on the (rare) collision with an existing login, draw again.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const loginId = generateLoginId();
      const { data: created, error } = await admin.auth.admin.createUser({
        email: technicalEmail(loginId),
        password: derivePassword(loginId, pin, pepper()),
        email_confirm: true,
        app_metadata: { login_kind: 'pin' },
      });
      if (error) {
        if (error.code === 'email_exists') continue;
        throw error;
      }
      const { error: finishError } = await admin.rpc('finish_employee_access', {
        p_company_id: office.companyId,
        p_employee_id: employeeId,
        p_user_id: created.user.id,
        p_login_id: loginId,
        p_reset: false,
      });
      if (finishError) {
        // Nothing half done: the technical login is removed if it could not be linked.
        await admin.auth.admin.deleteUser(created.user.id);
        throw finishError;
      }
      ctx.log('AUTH.ACCESS.CREATED');
      return { loginId, pin, reset: false };
    }
    throw new ActionError('conflict', 'login_id_exhausted');
  },
});
