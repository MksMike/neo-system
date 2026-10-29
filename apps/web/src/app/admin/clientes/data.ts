import 'server-only';
import type { Database } from '@neo/db';
import { userClient } from '@/server/session';

type Tables = Database['public']['Tables'];
export type OrganizationRow = Tables['organization']['Row'];
export type SiteRow = Tables['site']['Row'];

export interface ChainLink {
  id: string;
  version: number;
  client_id: string;
  organization_id: string;
  position: number;
  color: string;
  abbreviation: string;
  name: string;
}

function check<T>(result: { data: T | null; error: Error | null }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

/** Reads go through RLS (office roles, module on) and still filter the company explicitly. */
export async function listClients(companyId: string, q: string) {
  const supabase = await userClient();
  let query = supabase
    .from('organization')
    .select('id, name, name_kana, phone, address')
    .eq('company_id', companyId)
    .eq('is_client', true)
    .is('deleted_at', null)
    .order('name')
    .limit(200);
  if (q) {
    // LIKE wildcards are escaped, and the value is quoted so commas or parentheses typed in the
    // search cannot change the PostgREST filter.
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    const quoted = `"${like.replace(/["\\]/g, (c) => `\\${c}`)}"`;
    query = query.or(`name.ilike.${quoted},name_kana.ilike.${quoted}`);
  }
  const clients = check(await query);
  const ids = clients.map((c) => c.id);
  const [chains, sites] = await Promise.all([
    listChains(companyId, ids),
    countSites(companyId, ids),
  ]);
  return clients.map((c) => ({
    ...c,
    chain: chains.filter((l) => l.client_id === c.id),
    siteCount: sites.get(c.id) ?? 0,
  }));
}

export async function getOrganization(
  companyId: string,
  id: string,
): Promise<OrganizationRow | null> {
  const supabase = await userClient();
  return check(
    await supabase
      .from('organization')
      .select('*')
      .eq('company_id', companyId)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle(),
  );
}

/** Links of the given clients, closest to the client first, with the subcontractor name. */
export async function listChains(companyId: string, clientIds?: string[]): Promise<ChainLink[]> {
  if (clientIds?.length === 0) return [];
  const supabase = await userClient();
  let query = supabase
    .from('client_chain')
    .select(
      'id, version, client_id, organization_id, position, color, abbreviation, organization:organization_id(name)',
    )
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('position');
  if (clientIds) query = query.in('client_id', clientIds);
  const rows = check(await query);
  return rows.map((r) => ({
    id: r.id,
    version: r.version,
    client_id: r.client_id,
    organization_id: r.organization_id,
    position: r.position,
    color: r.color,
    abbreviation: r.abbreviation,
    name: (r.organization as { name: string } | null)?.name ?? '',
  }));
}

async function countSites(companyId: string, clientIds: string[]): Promise<Map<string, number>> {
  if (clientIds.length === 0) return new Map();
  const supabase = await userClient();
  const rows = check(
    await supabase
      .from('site')
      .select('client_id')
      .eq('company_id', companyId)
      .in('client_id', clientIds)
      .is('deleted_at', null),
  );
  const counts = new Map<string, number>();
  for (const r of rows)
    if (r.client_id) counts.set(r.client_id, (counts.get(r.client_id) ?? 0) + 1);
  return counts;
}

export async function listSites(companyId: string, clientId: string): Promise<SiteRow[]> {
  const supabase = await userClient();
  return check(
    await supabase
      .from('site')
      .select('*')
      .eq('company_id', companyId)
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .order('name'),
  );
}

/** Clients for selects (name and id). */
export async function clientOptions(companyId: string) {
  const supabase = await userClient();
  return check(
    await supabase
      .from('organization')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('is_client', true)
      .is('deleted_at', null)
      .order('name'),
  );
}
