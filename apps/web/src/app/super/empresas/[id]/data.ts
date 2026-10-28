import 'server-only';
import type { Database } from '@neo/db';
import { todayInTokyo } from '@neo/validation';
import { cache } from 'react';
import { userClient } from '@/server/session';
import type { NamedModule } from '../module-checklist';

type Tables = Database['public']['Tables'];
export type CompanyRow = Tables['company']['Row'];
export type ContractRow = Tables['contract']['Row'];
export type ModulePeriod = Pick<
  Tables['company_module']['Row'],
  'id' | 'module_key' | 'valid_from' | 'valid_to'
>;
export type ChargeRow = Tables['saas_charge']['Row'];
export type PaymentRow = Tables['saas_payment']['Row'];
export type InvitationRow = Tables['owner_invitation']['Row'];

/** Reads go through RLS: only the Super Admin sees platform tables (ADR 0023). */
function check<T>(result: { data: T | null; error: Error | null }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

/** The company itself, or null when the id does not exist (the page answers 404). Cached per request. */
export const getCompany = cache(async (id: string): Promise<CompanyRow | null> => {
  const supabase = await userClient();
  return check(
    await supabase.from('company').select('*').eq('id', id).is('deleted_at', null).maybeSingle(),
  );
});

export async function getModuleCatalog(locale: string): Promise<NamedModule[]> {
  const supabase = await userClient();
  const rows = check(
    await supabase
      .from('module')
      .select('key, kind, depends_on, depends_any, name_ja, name_pt')
      .is('deleted_at', null)
      .order('sort_order'),
  );
  return rows.map((m) => ({
    key: m.key,
    kind: m.kind as NamedModule['kind'],
    depends_on: m.depends_on,
    depends_any: m.depends_any,
    name: locale === 'ja' ? m.name_ja : m.name_pt,
  }));
}

export async function getModulePeriods(companyId: string): Promise<ModulePeriod[]> {
  const supabase = await userClient();
  return check(
    await supabase
      .from('company_module')
      .select('id, module_key, valid_from, valid_to')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('valid_from', { ascending: false }),
  );
}

/** Contract versions, newest first. */
export const getContracts = cache(async (companyId: string): Promise<ContractRow[]> => {
  const supabase = await userClient();
  return check(
    await supabase
      .from('contract')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('valid_from', { ascending: false }),
  );
});

/** The version in force today and the one scheduled to replace it, if any (R00-05). */
export function splitContracts(contracts: ContractRow[], today = todayInTokyo()) {
  const open = contracts.find((c) => c.valid_to === null) ?? null;
  const inForce =
    contracts.find((c) => c.valid_from <= today && (c.valid_to === null || c.valid_to >= today)) ??
    null;
  const scheduled = open && open.valid_from > today ? open : null;
  return { open, inForce, scheduled };
}

export async function getBilling(companyId: string) {
  const supabase = await userClient();
  const [charges, payments] = await Promise.all([
    supabase
      .from('saas_charge')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('period_start', { ascending: false })
      .limit(24),
    supabase
      .from('saas_payment')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('paid_on', { ascending: false })
      .limit(24),
  ]);
  return { charges: check(charges), payments: check(payments) };
}

export async function getUsers(companyId: string) {
  const supabase = await userClient();
  const [memberships, invitations] = await Promise.all([
    supabase
      .from('membership')
      .select('id, user_id, role, status, created_at')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at'),
    supabase
      .from('owner_invitation')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ]);
  const members = check(memberships);
  const profiles =
    members.length > 0
      ? check(
          await supabase
            .from('user_profile')
            .select('user_id, display_name')
            .in(
              'user_id',
              members.map((m) => m.user_id),
            ),
        )
      : [];
  const names = new Map(profiles.map((p) => [p.user_id, p.display_name]));
  return {
    members: members.map((m) => ({ ...m, name: names.get(m.user_id) ?? null })),
    invitations: check(invitations),
  };
}

export interface HistoryEntry {
  id: string;
  at: string;
  kind: 'status' | 'action';
  action: string;
  actor: string | null;
  fromStatus?: string | null;
  toStatus?: string;
  reason?: string | null;
  source?: string;
  payload?: Record<string, unknown>;
}

/** Status changes and Super Admin actions, newest first (R00-08). */
export async function getHistory(companyId: string): Promise<HistoryEntry[]> {
  const supabase = await userClient();
  const [statusEvents, actions] = await Promise.all([
    supabase
      .from('company_status_event')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('platform_audit_log')
      .select('id, actor_id, action, payload, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);
  const events = check(statusEvents);
  const logs = check(actions);
  const actorIds = [
    ...new Set(
      [...events.map((e) => e.actor_id), ...logs.map((l) => l.actor_id)].filter(
        (v): v is string => v !== null,
      ),
    ),
  ];
  const admins =
    actorIds.length > 0
      ? check(await supabase.from('platform_admin').select('user_id, name').in('user_id', actorIds))
      : [];
  const actorName = (id: string | null) =>
    id ? (admins.find((a) => a.user_id === id)?.name ?? null) : null;

  return [
    ...events.map((e): HistoryEntry => ({
      id: e.id,
      at: e.created_at,
      kind: 'status',
      action: 'status.changed',
      actor: actorName(e.actor_id),
      fromStatus: e.from_status,
      toStatus: e.to_status,
      reason: e.reason,
      source: e.source,
    })),
    ...logs.map((l): HistoryEntry => ({
      id: l.id,
      at: l.created_at,
      kind: 'action',
      action: l.action,
      actor: actorName(l.actor_id),
      payload: l.payload as Record<string, unknown>,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 100);
}
