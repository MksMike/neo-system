-- Layer 06: assignments (escalações) and the employees allocated to them, with the calendar view.
-- Demonstration scope (ADR 0025): no prices yet; daily records (Pendente -> Confirmado) come with
-- layer 07.

create table public.assignment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  client_id uuid not null references public.organization (id),
  -- The subcontractor of the client chain this work comes through (color and abbreviation).
  chain_id uuid references public.client_chain (id),
  site_id uuid references public.site (id),
  title text check (char_length(title) <= 120),
  starts_on date not null,
  ends_on date not null,
  start_time time not null,
  end_time time not null,
  break_minutes integer not null default 60 check (break_minutes between 0 and 480),
  -- ISO weekdays worked (1 = Monday ... 7 = Sunday); the other days are 休.
  work_days smallint[] not null default '{1,2,3,4,5}'
    check (cardinality(work_days) between 1 and 7 and work_days <@ '{1,2,3,4,5,6,7}'),
  meeting_place text check (char_length(meeting_place) <= 200),
  meeting_time time,
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check (ends_on >= starts_on),
  check (ends_on - starts_on <= 366),
  check (start_time <> end_time)
);

create index assignment_company_idx on public.assignment (company_id, starts_on, ends_on);

create table public.assignment_member (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  assignment_id uuid not null references public.assignment (id),
  employee_id uuid not null references public.employee (id),
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check (ends_on >= starts_on)
);

create unique index assignment_member_key on public.assignment_member (assignment_id, employee_id)
  where deleted_at is null;
create index assignment_member_employee_idx on public.assignment_member (company_id, employee_id, starts_on);

call app.add_standard_triggers('public.assignment', 'company');
call app.add_standard_triggers('public.assignment_member', 'company');

alter table public.assignment enable row level security;
alter table public.assignment_member enable row level security;
grant select on public.assignment, public.assignment_member to authenticated;

create policy office_read on public.assignment for select to authenticated
  using (app.has_role(company_id, array['owner', 'manager', 'coordinator']) and public.has_module(company_id, 'scheduling'));
create policy office_read on public.assignment_member for select to authenticated
  using (app.has_role(company_id, array['owner', 'manager', 'coordinator']) and public.has_module(company_id, 'scheduling'));

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Minutes of the day of a time range; a range that ends before it starts crosses midnight (夜勤).
create function app.shift_bounds(p_start time, p_end time, out from_min integer, out to_min integer)
language sql immutable set search_path = ''
as $$
  select (extract(epoch from p_start) / 60)::integer,
         (extract(epoch from p_end) / 60)::integer + case when p_end < p_start then 1440 else 0 end
$$;

-- R06-02: the same employee may work two stretches on a date only if their hours do not overlap.
-- Returns the first conflicting assignment of the employee in the range, or null.
create function app.find_overlap(
  p_company_id uuid, p_employee_id uuid, p_assignment_id uuid, p_from date, p_to date
) returns uuid
language sql stable set search_path = ''
as $$
  select other.id
  from public.assignment mine
  cross join lateral app.shift_bounds(mine.start_time, mine.end_time) mb
  join public.assignment_member om
    on om.company_id = p_company_id and om.employee_id = p_employee_id
   and om.assignment_id <> mine.id and om.deleted_at is null
  join public.assignment other on other.id = om.assignment_id and other.deleted_at is null
  cross join lateral app.shift_bounds(other.start_time, other.end_time) ob
  cross join lateral generate_series(greatest(p_from, om.starts_on), least(p_to, om.ends_on), interval '1 day') d
  where mine.id = p_assignment_id
    and extract(isodow from d)::smallint = any (mine.work_days)
    and extract(isodow from d)::smallint = any (other.work_days)
    and mb.from_min < ob.to_min and ob.from_min < mb.to_min
  limit 1
$$;

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- p = { id, company_id, version?, client_id, chain_id, site_id, title, starts_on, ends_on, start_time,
--       end_time, break_minutes, work_days, meeting_place, meeting_time, note }
-- Creates with the id from the screen (a retry returns the same row) or edits with `version`.
create function public.save_assignment(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := (p ->> 'id')::uuid;
  v_company uuid := (p ->> 'company_id')::uuid;
  v_client uuid := (p ->> 'client_id')::uuid;
  v_chain uuid := nullif(p ->> 'chain_id', '')::uuid;
  v_site uuid := nullif(p ->> 'site_id', '')::uuid;
  v_starts date := (p ->> 'starts_on')::date;
  v_ends date := (p ->> 'ends_on')::date;
  v_days smallint[] := array(select jsonb_array_elements_text(coalesce(p -> 'work_days', '[1,2,3,4,5]'))::smallint);
  existing public.assignment;
  saved public.assignment;
begin
  perform app.require_company_write(v_company, 'scheduling', array['owner', 'manager', 'coordinator']);

  if not exists (select 1 from public.organization o
                 where o.id = v_client and o.company_id = v_company and o.is_client and o.deleted_at is null) then
    perform app.raise('not_found', 'client_not_found');
  end if;
  if v_chain is not null and not exists (
    select 1 from public.client_chain c
    where c.id = v_chain and c.client_id = v_client and c.company_id = v_company and c.deleted_at is null
  ) then
    perform app.raise('validation', 'chain_not_of_client');
  end if;
  if v_site is not null and not exists (
    select 1 from public.site s
    where s.id = v_site and s.company_id = v_company and s.deleted_at is null
      and (s.client_id is null or s.client_id = v_client)
  ) then
    perform app.raise('validation', 'site_not_of_client');
  end if;
  if v_starts is null or v_ends is null or v_ends < v_starts then
    perform app.raise('validation', 'period_invalid');
  end if;

  select * into existing from public.assignment a where a.id = v_id for update;
  if existing.id is not null and (existing.company_id <> v_company or existing.deleted_at is not null) then
    perform app.raise('not_found', 'assignment_not_found');
  end if;

  if existing.id is null then
    insert into public.assignment (
      id, company_id, client_id, chain_id, site_id, title, starts_on, ends_on, start_time, end_time,
      break_minutes, work_days, meeting_place, meeting_time, note
    ) values (
      v_id, v_company, v_client, v_chain, v_site, nullif(trim(p ->> 'title'), ''), v_starts, v_ends,
      (p ->> 'start_time')::time, (p ->> 'end_time')::time, coalesce((p ->> 'break_minutes')::integer, 60),
      v_days, nullif(trim(p ->> 'meeting_place'), ''), nullif(p ->> 'meeting_time', '')::time,
      nullif(trim(p ->> 'note'), '')
    ) returning * into saved;
  else
    if (p ->> 'version') is null then
      return to_jsonb(existing); -- retry of the creation that already succeeded
    end if;
    if existing.version <> (p ->> 'version')::integer then
      perform app.raise('conflict', 'concurrent_update');
    end if;
    -- Allocations must stay inside the period.
    if exists (select 1 from public.assignment_member m
               where m.assignment_id = v_id and m.deleted_at is null
                 and (m.starts_on < v_starts or m.ends_on > v_ends)) then
      perform app.raise('validation', 'members_outside_period');
    end if;
    update public.assignment set
      client_id = v_client, chain_id = v_chain, site_id = v_site, title = nullif(trim(p ->> 'title'), ''),
      starts_on = v_starts, ends_on = v_ends,
      start_time = (p ->> 'start_time')::time, end_time = (p ->> 'end_time')::time,
      break_minutes = coalesce((p ->> 'break_minutes')::integer, existing.break_minutes),
      work_days = v_days, meeting_place = nullif(trim(p ->> 'meeting_place'), ''),
      meeting_time = nullif(p ->> 'meeting_time', '')::time, note = nullif(trim(p ->> 'note'), '')
    where id = v_id
    returning * into saved;
  end if;
  return to_jsonb(saved);
end
$$;

-- p = { id, company_id, assignment_id, employee_id, starts_on?, ends_on? }
-- Allocates an employee to an assignment, for the whole period or an interval inside it.
-- Refuses an employee already in it and hours that overlap another assignment (R06-02).
create function public.add_assignment_member(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := (p ->> 'id')::uuid;
  v_company uuid := (p ->> 'company_id')::uuid;
  asg public.assignment;
  existing public.assignment_member;
  saved public.assignment_member;
  v_from date;
  v_to date;
  overlap uuid;
begin
  perform app.require_company_write(v_company, 'scheduling', array['owner', 'manager', 'coordinator']);

  select * into existing from public.assignment_member m where m.id = v_id;
  if existing.id is not null then
    if existing.company_id <> v_company then
      perform app.raise('not_found', 'member_not_found');
    end if;
    return to_jsonb(existing); -- retry of an allocation that already succeeded
  end if;

  select * into asg from public.assignment a
  where a.id = (p ->> 'assignment_id')::uuid and a.company_id = v_company and a.deleted_at is null
  for update;
  if asg.id is null then
    perform app.raise('not_found', 'assignment_not_found');
  end if;
  if not exists (select 1 from public.employee e
                 where e.id = (p ->> 'employee_id')::uuid and e.company_id = v_company
                   and e.deleted_at is null and e.status = 'active') then
    perform app.raise('not_found', 'employee_not_found');
  end if;

  v_from := coalesce(nullif(p ->> 'starts_on', '')::date, asg.starts_on);
  v_to := coalesce(nullif(p ->> 'ends_on', '')::date, asg.ends_on);
  if v_from < asg.starts_on or v_to > asg.ends_on or v_to < v_from then
    perform app.raise('validation', 'member_outside_period');
  end if;
  if exists (select 1 from public.assignment_member m
             where m.assignment_id = asg.id and m.employee_id = (p ->> 'employee_id')::uuid and m.deleted_at is null) then
    perform app.raise('conflict', 'member_duplicate');
  end if;

  overlap := app.find_overlap(v_company, (p ->> 'employee_id')::uuid, asg.id, v_from, v_to);
  if overlap is not null then
    perform app.raise('conflict', 'schedule_overlap:' || overlap);
  end if;

  insert into public.assignment_member (id, company_id, assignment_id, employee_id, starts_on, ends_on)
  values (v_id, v_company, asg.id, (p ->> 'employee_id')::uuid, v_from, v_to)
  returning * into saved;
  return to_jsonb(saved);
end
$$;

-- Removes an allocation (logical deletion, CLAUDE.md rule 5).
create function public.remove_assignment_member(p_company_id uuid, p_member_id uuid, p_version integer)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  existing public.assignment_member;
begin
  perform app.require_company_write(p_company_id, 'scheduling', array['owner', 'manager', 'coordinator']);
  select * into existing from public.assignment_member m
  where m.id = p_member_id and m.company_id = p_company_id and m.deleted_at is null
  for update;
  if existing.id is null then
    perform app.raise('not_found', 'member_not_found');
  end if;
  if existing.version <> p_version then
    perform app.raise('conflict', 'concurrent_update');
  end if;
  update public.assignment_member set deleted_at = now() where id = existing.id;
end
$$;

-- Planned days of the company between two dates (max 62): one row per employee, day and assignment.
-- Days outside the work days of the assignment come as off days (休).
create function public.calendar_days(p_company_id uuid, p_from date, p_to date, p_assignment_id uuid default null)
returns table (
  day date, employee_id uuid, employee_name text, assignment_id uuid, member_id uuid, off boolean,
  start_time time, end_time time, client_name text, site_name text, color text, abbreviation text, title text
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not (app.has_role(p_company_id, array['owner', 'manager', 'coordinator'])
          and public.has_module(p_company_id, 'scheduling')) then
    perform app.raise('forbidden', 'role_required');
  end if;
  if p_to < p_from or p_to - p_from > 62 then
    perform app.raise('validation', 'range_invalid');
  end if;
  return query
    select d::date, e.id, e.full_name, a.id, m.id,
           not (extract(isodow from d)::smallint = any (a.work_days)),
           a.start_time, a.end_time, o.name, s.name, c.color, c.abbreviation, a.title
    from public.assignment_member m
    join public.assignment a on a.id = m.assignment_id and a.deleted_at is null
    join public.employee e on e.id = m.employee_id
    join public.organization o on o.id = a.client_id
    left join public.site s on s.id = a.site_id
    left join public.client_chain c on c.id = a.chain_id
    cross join lateral generate_series(greatest(m.starts_on, p_from), least(m.ends_on, p_to), interval '1 day') d
    where m.company_id = p_company_id and m.deleted_at is null
      and (p_assignment_id is null or a.id = p_assignment_id)
    order by e.full_name, d, a.start_time;
end
$$;

revoke execute on function
  public.save_assignment(jsonb), public.add_assignment_member(jsonb),
  public.remove_assignment_member(uuid, uuid, integer), public.calendar_days(uuid, date, date, uuid)
from public, anon;
grant execute on function
  public.save_assignment(jsonb), public.add_assignment_member(jsonb),
  public.remove_assignment_member(uuid, uuid, integer), public.calendar_days(uuid, date, date, uuid)
to authenticated;
