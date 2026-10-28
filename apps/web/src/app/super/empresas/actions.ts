'use server';

import { ActionError, type Json } from '@neo/db';
import { companyCode } from '@neo/validation';
import { z } from 'zod';
import { defineAction } from '@/server/define-action';
import { getSession, userClient } from '@/server/session';
import { provisionSchema } from './schema';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session?.isPlatformAdmin) throw new ActionError('forbidden', 'super_admin_required');
}

/** Step 1: tells at once whether the code is free (R00-01). The database checks again on create. */
export const checkCompanyCode = defineAction({
  name: 'company.check_code',
  schema: z.object({ code: companyCode }),
  handler: async ({ code }) => {
    await requireSuperAdmin();
    const supabase = await userClient();
    const { count, error } = await supabase
      .from('company')
      .select('id', { count: 'exact', head: true })
      .eq('code', code);
    if (error) throw error;
    return { available: count === 0 };
  },
});

/**
 * Creates the company in one transaction (R00-02, ADR 0012): company, contract, modules,
 * owner invitation in the queue and log. Safe to retry: the id comes from the screen.
 */
export const provisionCompany = defineAction({
  name: 'company.provision',
  schema: provisionSchema,
  handler: async (input, ctx) => {
    await requireSuperAdmin();
    const { company: c, contract: ct } = input;
    const payload = {
      id: input.id,
      company: {
        code: c.code,
        legal_name: c.legalName,
        legal_name_kana: c.legalNameKana ?? null,
        display_name: c.displayName ?? null,
        invoice_reg_no: c.invoiceRegNo ?? null,
        postal_code: c.postalCode ?? null,
        address: c.address ?? null,
        phone: c.phone ?? null,
        email: c.email ?? null,
        referred_by_company_id: c.referredBy || null,
      },
      modules: input.modules,
      contract:
        ct.type === 'partner'
          ? { type: ct.type, starts_on: ct.startsOn }
          : {
              type: ct.type,
              price_yen: ct.priceYen ?? null,
              payment_method: ct.paymentMethod ?? null,
              starts_on: ct.startsOn,
              trial_days: ct.trialDays,
            },
      owner: input.owner,
    } satisfies Json;

    const supabase = await userClient();
    const { data: companyId, error } = await supabase.rpc('provision_company', { p: payload });
    if (error) throw error;
    ctx.log('APP.COMPANY.PROVISIONED', { companyId, contractType: ct.type });
    return { companyId, code: c.code };
  },
});
