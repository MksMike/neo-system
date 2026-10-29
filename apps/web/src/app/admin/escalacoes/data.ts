import 'server-only';
import type { Database } from '@neo/db';
import { userClient } from '@/server/session';

export type AssignmentRow = Database['public']['Tables']['assignment']['Row'];
type CalendarRow = Database['public']['Functions']['calendar_days']['Returns'][number];
/** The generated type marks every column as present; the optional joins can bring nulls. */
export type CalendarDay = Omit<CalendarRow, 'color' | 'abbreviation' | 'site_name' | 'title'> & {
  color: string | null;
  abbreviation: string | null;
  site_name: string | null;
  title: string | null;
};

function check<T>(result: { data: T | null; error: Error | null }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

/** Planned days of the company in a range (the database expands allocations into days). */
export async function getCalendar(
  companyId: string,
  from: string,
  to: string,
  assignmentId?: string,
): Promise<CalendarDay[]> {
  const supabase = await userClient();
  return check(
    await supabase.rpc('calendar_days', {
      p_company_id: companyId,
      p_from: from,
      p_to: to,
      ...(assignmentId ? { p_assignment_id: assignmentId } : {}),
    }),
  );
}

export interface AssignmentSummary extends AssignmentRow {
  clientName: string;
  siteName: string | null;
  chain: { color: string; abbreviation: string; name: string } | null;
  memberCount: number;
}

const SUMMARY_SELECT =
  '*, client:client_id(name), site:site_id(name), chain:chain_id(color, abbreviation, organization:organization_id(name)), members:assignment_member(id, deleted_at)';

function toSummary(row: unknown): AssignmentSummary {
  const r = row as AssignmentRow & {
    client: { name: string } | null;
    site: { name: string } | null;
    chain: { color: string; abbreviation: string; organization: { name: string } | null } | null;
    members: { id: string; deleted_at: string | null }[];
  };
  const { client, site, chain, members, ...rest } = r;
  return {
    ...rest,
    clientName: client?.name ?? '',
    siteName: site?.name ?? null,
    chain: chain
      ? {
          color: chain.color,
          abbreviation: chain.abbreviation,
          name: chain.organization?.name ?? '',
        }
      : null,
    memberCount: members.filter((m) => m.deleted_at === null).length,
  };
}

/** Assignments that touch a range, earliest first. */
export async function listAssignments(companyId: string, from: string, to: string) {
  const supabase = await userClient();
  const rows = check(
    await supabase
      .from('assignment')
      .select(SUMMARY_SELECT)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .lte('starts_on', to)
      .gte('ends_on', from)
      .order('starts_on')
      .limit(100),
  );
  return rows.map(toSummary);
}

export async function getAssignment(
  companyId: string,
  id: string,
): Promise<AssignmentSummary | null> {
  const supabase = await userClient();
  const { data, error } = await supabase
    .from('assignment')
    .select(SUMMARY_SELECT)
    .eq('company_id', companyId)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  return data ? toSummary(data) : null;
}

export async function listMembers(companyId: string, assignmentId: string) {
  const supabase = await userClient();
  const rows = check(
    await supabase
      .from('assignment_member')
      .select('id, version, starts_on, ends_on, employee:employee_id(id, full_name)')
      .eq('company_id', companyId)
      .eq('assignment_id', assignmentId)
      .is('deleted_at', null)
      .order('starts_on'),
  );
  return rows.map((r) => {
    const employee = r.employee as { id: string; full_name: string } | null;
    return {
      id: r.id,
      version: r.version,
      startsOn: r.starts_on,
      endsOn: r.ends_on,
      employeeId: employee?.id ?? '',
      name: employee?.full_name ?? '',
    };
  });
}

/** Clients with their chain and sites, for the assignment form. */
export async function formOptions(companyId: string) {
  const supabase = await userClient();
  const [clients, chains, sites] = await Promise.all([
    supabase
      .from('organization')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('is_client', true)
      .is('deleted_at', null)
      .order('name'),
    supabase
      .from('client_chain')
      .select('id, client_id, color, abbreviation, organization:organization_id(name)')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('position'),
    supabase
      .from('site')
      .select('id, client_id, name')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name'),
  ]);
  return {
    clients: check(clients),
    chains: check(chains).map((c) => ({
      id: c.id,
      clientId: c.client_id,
      color: c.color,
      abbreviation: c.abbreviation,
      name: (c.organization as { name: string } | null)?.name ?? '',
    })),
    sites: check(sites).map((s) => ({ id: s.id, clientId: s.client_id, name: s.name })),
  };
}

export async function activeEmployees(companyId: string) {
  const supabase = await userClient();
  return check(
    await supabase
      .from('employee')
      .select('id, full_name')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('full_name'),
  );
}
