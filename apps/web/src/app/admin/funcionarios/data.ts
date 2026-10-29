import 'server-only';
import type { Database } from '@neo/db';
import { userClient } from '@/server/session';

export type EmployeeRow = Database['public']['Tables']['employee']['Row'];

function check<T>(result: { data: T | null; error: Error | null }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

/** The 8-digit IDs of the given logins (profiles readable by the office through the employee link). */
async function loginIds(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const supabase = await userClient();
  const { data, error } = await supabase.rpc('employee_login_ids', { p_user_ids: userIds });
  if (error) throw error;
  return new Map(data.map((r) => [r.user_id, r.login_id]));
}

/** Reads go through RLS (office roles, module on) and still filter the company explicitly. */
export async function listEmployees(companyId: string, q: string) {
  const supabase = await userClient();
  let query = supabase
    .from('employee')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('status')
    .order('full_name')
    .limit(500);
  if (q) {
    // Same escaping as the clients list: LIKE wildcards, then the quoted PostgREST value.
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    const quoted = `"${like.replace(/["\\]/g, (c) => `\\${c}`)}"`;
    query = query.or(`full_name.ilike.${quoted},name_kana.ilike.${quoted}`);
  }
  const rows = check(await query);
  const ids = await loginIds(rows.flatMap((r) => (r.user_id ? [r.user_id] : [])));
  return rows.map((r) => ({ ...r, loginId: r.user_id ? (ids.get(r.user_id) ?? null) : null }));
}

export async function getEmployee(companyId: string, id: string) {
  const supabase = await userClient();
  const { data: row, error } = await supabase
    .from('employee')
    .select('*')
    .eq('company_id', companyId)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const ids = await loginIds(row.user_id ? [row.user_id] : []);
  return { ...row, loginId: row.user_id ? (ids.get(row.user_id) ?? null) : null };
}
