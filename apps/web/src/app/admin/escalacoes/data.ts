import 'server-only';
import type { Database } from '@neo/db';
import { userClient } from '@/server/session';
import type { DayStatus, Period } from './schema';

export type AssignmentRow = Database['public']['Tables']['assignment']['Row'];
type DayRow = Database['public']['Tables']['assignment_day']['Row'];

export interface Chain {
  id: string;
  color: string;
  abbreviation: string;
  name: string;
}

export interface AssignmentSummary extends AssignmentRow {
  clientName: string;
  siteName: string | null;
  chain: Chain | null;
}

/** One day of one employee, with the names the screen shows. */
export interface BoardDay extends Omit<DayRow, 'status' | 'period'> {
  status: DayStatus;
  period: Period;
  employeeName: string;
  chain: Chain | null;
  siteName: string | null;
}

export interface Board extends AssignmentSummary {
  days: BoardDay[];
}

function check<T>(result: { data: T | null; error: Error | null }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

type ChainJoin = {
  id: string;
  color: string;
  abbreviation: string;
  organization: { name: string } | null;
} | null;

function toChain(chain: ChainJoin): Chain | null {
  return chain
    ? {
        id: chain.id,
        color: chain.color,
        abbreviation: chain.abbreviation,
        name: chain.organization?.name ?? '',
      }
    : null;
}

const CHAIN_SELECT = 'id, color, abbreviation, organization:organization_id(name)';
const SUMMARY_SELECT = `*, client:client_id(name), site:site_id(name), chain:chain_id(${CHAIN_SELECT})`;

function toSummary(row: unknown): AssignmentSummary {
  const r = row as AssignmentRow & {
    client: { name: string } | null;
    site: { name: string } | null;
    chain: ChainJoin;
  };
  const { client, site, chain, ...rest } = r;
  return {
    ...rest,
    clientName: client?.name ?? '',
    siteName: site?.name ?? null,
    chain: toChain(chain),
  };
}

async function daysOf(companyId: string, assignmentIds: string[]): Promise<BoardDay[]> {
  if (assignmentIds.length === 0) return [];
  const supabase = await userClient();
  const rows = check(
    await supabase
      .from('assignment_day')
      .select(
        `*, employee:employee_id(full_name), site:site_id(name), chain:chain_id(${CHAIN_SELECT})`,
      )
      .eq('company_id', companyId)
      .in('assignment_id', assignmentIds)
      .is('deleted_at', null)
      .order('day')
      .limit(5000),
  );
  return rows.map((row) => {
    const r = row as unknown as DayRow & {
      employee: { full_name: string } | null;
      site: { name: string } | null;
      chain: ChainJoin;
    };
    const { employee, site, chain, ...rest } = r;
    return {
      ...rest,
      status: rest.status as DayStatus,
      period: rest.period as Period,
      employeeName: employee?.full_name ?? '',
      siteName: site?.name ?? null,
      chain: toChain(chain),
    };
  });
}

/** Assignments that touch a range (the month on screen), each with all of its days. */
export async function listBoards(companyId: string, from: string, to: string): Promise<Board[]> {
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
  ).map(toSummary);
  const days = await daysOf(
    companyId,
    rows.map((r) => r.id),
  );
  return rows.map((a) => ({ ...a, days: days.filter((d) => d.assignment_id === a.id) }));
}

export async function getBoard(companyId: string, id: string): Promise<Board | null> {
  const supabase = await userClient();
  const { data, error } = await supabase
    .from('assignment')
    .select(SUMMARY_SELECT)
    .eq('company_id', companyId)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const summary = toSummary(data);
  return { ...summary, days: await daysOf(companyId, [id]) };
}

/** Clients with their chain and sites, for the forms. */
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
