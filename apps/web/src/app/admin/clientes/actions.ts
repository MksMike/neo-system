'use server';

import { ActionError, type Json } from '@neo/db';
import { freeText } from '@neo/validation';
import { z } from 'zod';
import { defineAction } from '@/server/define-action';
import { officeForAction } from '@/server/office';
import { userClient } from '@/server/session';
import { chainUpdateSchema, linkSchema, organizationSchema, siteSchema } from './schema';

/** Creates (id from the screen, safe to retry) or edits (with `version`) an organization. */
export const saveOrganization = defineAction({
  name: 'organization.save',
  schema: organizationSchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const payload = {
      id: input.id,
      company_id: office.companyId,
      ...(input.version ? { version: input.version } : {}),
      name: input.name,
      name_kana: input.nameKana ?? null,
      is_client: input.isClient,
      postal_code: input.postalCode ?? null,
      address: input.address ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      invoice_reg_no: input.invoiceRegNo ?? null,
      note: input.note ?? null,
    } satisfies Json;
    const { data, error } = await supabase.rpc('save_organization', { p: payload });
    if (error) throw error;
    const saved = data as { id: string; version: number };
    return { id: saved.id, version: saved.version };
  },
});

/** Organizations with a similar name, shown before a quick registration (R04-02). */
export const findOrganizations = defineAction({
  name: 'organization.find',
  schema: z.object({ name: freeText({ min: 1, max: 200 }) }),
  handler: async ({ name }) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { data, error } = await supabase.rpc('find_organizations', {
      p_company_id: office.companyId,
      p_name: name,
    });
    if (error) throw error;
    return data;
  },
});

/** Links a subcontractor above a client, creating it on the spot when it is new (quick "+"). */
export const linkSubcontractor = defineAction({
  name: 'organization.link_subcontractor',
  schema: linkSchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const payload = {
      id: input.id,
      company_id: office.companyId,
      client_id: input.clientId,
      position: input.position,
      ...(input.abbreviation ? { abbreviation: input.abbreviation } : {}),
      ...(input.organizationId
        ? { organization_id: input.organizationId }
        : { organization: { id: input.newOrganizationId ?? null, name: input.name ?? '' } }),
    } satisfies Json;
    const { data, error } = await supabase.rpc('link_subcontractor', { p: payload });
    if (error) throw error;
    return { id: (data as { id: string }).id };
  },
});

/** Changes color, abbreviation or position of a link, or removes it (logical deletion). */
export const updateChain = defineAction({
  name: 'organization.update_chain',
  schema: chainUpdateSchema,
  handler: async (input) => {
    const office = await officeForAction();
    if (!office.canEdit) throw new ActionError('forbidden', 'role_required');
    const supabase = await userClient();
    const { error } = await supabase.rpc('update_chain', {
      p: {
        id: input.id,
        company_id: office.companyId,
        version: input.version,
        color: input.color ?? null,
        abbreviation: input.abbreviation ?? null,
        position: input.position ?? null,
        removed: input.removed ?? false,
      },
    });
    if (error) throw error;
    return { id: input.id };
  },
});

/** Creates or edits a work site. */
export const saveSite = defineAction({
  name: 'site.save',
  schema: siteSchema,
  handler: async (input) => {
    const office = await officeForAction();
    const supabase = await userClient();
    const { data, error } = await supabase.rpc('save_site', {
      p: {
        id: input.id,
        company_id: office.companyId,
        ...(input.version ? { version: input.version } : {}),
        client_id: input.clientId || null,
        name: input.name,
        postal_code: input.postalCode ?? null,
        address: input.address ?? null,
        radius_m: input.radiusM,
        note: input.note ?? null,
      },
    });
    if (error) throw error;
    return { id: (data as { id: string }).id };
  },
});
