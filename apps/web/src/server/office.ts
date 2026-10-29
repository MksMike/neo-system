import 'server-only';
import { ActionError } from '@neo/db';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { activeOfficeMembership, userClient } from './session';

/** Roles that register and edit (owner and manager, docs/00-ancora.md "Papéis"). */
export const EDITOR_ROLES = ['owner', 'manager'] as const;

export interface OfficeContext {
  companyId: string;
  role: string;
  /** Owner or manager: may create and edit; the coordinator only reads. */
  canEdit: boolean;
}

async function moduleOn(companyId: string, moduleKey: string): Promise<boolean> {
  const supabase = await userClient();
  const { data, error } = await supabase.rpc('has_module', {
    p_company_id: companyId,
    p_module_key: moduleKey,
  });
  if (error) throw error;
  return data;
}

/**
 * For pages: the active company and role. A module that is off answers 404 (R00-03); the database
 * refuses it again in every read and write.
 */
export const requireOffice = cache(async (moduleKey?: string): Promise<OfficeContext> => {
  const membership = await activeOfficeMembership();
  if (!membership) redirect('/login');
  if (moduleKey && !(await moduleOn(membership.company_id, moduleKey))) notFound();
  return {
    companyId: membership.company_id,
    role: membership.role,
    canEdit: (EDITOR_ROLES as readonly string[]).includes(membership.role),
  };
});

/**
 * For Server Actions: the company always comes from the session, never from the screen.
 * Role, module and company status are checked again in the SQL function (ADR 0023).
 */
export async function officeForAction(): Promise<OfficeContext> {
  const membership = await activeOfficeMembership();
  if (!membership) throw new ActionError('forbidden', 'not_signed_in');
  return {
    companyId: membership.company_id,
    role: membership.role,
    canEdit: (EDITOR_ROLES as readonly string[]).includes(membership.role),
  };
}
