'use server';

import { ActionError } from '@neo/db';
import { defineAction } from '@/server/define-action';
import { getSession, userClient } from '@/server/session';
import { contractChangeSchema, modulesChangeSchema } from '../schema';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session?.isPlatformAdmin) throw new ActionError('forbidden', 'super_admin_required');
}

/**
 * Turns modules on and off from a date (R00-04, R00-05). `expected` is what the screen showed:
 * if it changed meanwhile, the database answers `conflict` (ADR 0020). Not retried: a second
 * run would see its own change and conflict.
 */
export const setCompanyModules = defineAction({
  name: 'company.set_modules',
  schema: modulesChangeSchema,
  handler: async (input) => {
    await requireSuperAdmin();
    const supabase = await userClient();
    const { data, error } = await supabase.rpc('set_company_modules', {
      p_company_id: input.companyId,
      p_module_keys: input.modules,
      p_valid_from: input.validFrom,
      p_expected: input.expected,
    });
    if (error) throw error;
    const result = data as unknown as { enabled: string[]; auto_added: string[] };
    return { enabled: result.enabled, autoAdded: result.auto_added };
  },
});

/** New contract version from a date; the previous one ends the day before (R00-05). */
export const changeContract = defineAction({
  name: 'company.change_contract',
  schema: contractChangeSchema,
  handler: async (input) => {
    await requireSuperAdmin();
    const supabase = await userClient();
    const contract =
      input.type === 'partner'
        ? { type: input.type, note: input.note ?? null }
        : {
            type: input.type,
            price_yen: input.priceYen ?? null,
            payment_method: input.paymentMethod ?? null,
            note: input.note ?? null,
          };
    const { data, error } = await supabase.rpc('change_contract', {
      p_company_id: input.companyId,
      p: contract,
      p_valid_from: input.validFrom,
      ...(input.expectedContractId ? { p_expected_contract_id: input.expectedContractId } : {}),
    });
    if (error) throw error;
    return { contractId: data };
  },
});
