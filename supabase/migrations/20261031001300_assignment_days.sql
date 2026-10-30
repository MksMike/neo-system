-- Layer 06, version 2 (ADR 0027): the day of each employee is a record of its own.
-- The assignment holds one client, one closed month (28 to 31 days) and the defaults of the day
-- (subcontractor, site, hours, price, tax, extras); each assignment_day starts from those defaults
-- and keeps whatever the office changes on that day. Prices are integer yen (CLAUDE.md rule 2).

-- ---------------------------------------------------------------------------
-- Assignment: price, tax, extras and the title shown on the documents
-- ---------------------------------------------------------------------------

alter table public.assignment
  -- Daily price charged to the client; 0 = not informed yet.
  add column day_rate bigint not null default 0 check (day_rate between 0 and 10000000),
  add column tax_rate smallint not null default 10 check (tax_rate in (0, 8, 10)),
  -- Some clients pay a daily price that already includes the consumption tax (税込).
  add column price_includes_tax boolean not null default false,
  -- Where the title is printed: 請求書, 勤怠表 or both (below the subcontractor name).
  add column title_show_on text not null default 'both' check (title_show_on in ('invoice', 'timesheet', 'both')),
  -- Extra per day (e.g. 出張手当): charged to the client and paid to the employee, usually untaxed.
  add column extra_description text check (char_length(extra_description) <= 60),
  add column extra_client_amount bigint not null default 0 check (extra_client_amount between 0 and 1000000),
  add column extra_employee_amount bigint not null default 0 check (extra_employee_amount between 0 and 1000000),
  add column extra_client_taxable boolean not null default false,
  alter column work_days set default '{1,2,3,4,5,6,7}';

-- R06-06: an assignment is one closed month (at most 31 days). Older rows are not checked.
alter table public.assignment add constraint assignment_month_check check (ends_on - starts_on <= 30) not valid;

comment on table public.assignment_member is
  'Replaced by assignment_day (migration 20261031001300); kept read-only for the history.';

-- ---------------------------------------------------------------------------
-- The day of an employee in an assignment
-- ---------------------------------------------------------------------------

create table public.assignment_day (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  assignment_id uuid not null references public.assignment (id),
  employee_id uuid not null references public.employee (id),
  day date not null,
  -- pending = not registered yet; work = worked; off = 休.
  status text not null default 'pending' check (status in ('pending', 'work', 'off')),
  -- 定時, 半日, 残業, 早出, 夜勤, por hora.
  period text not null default 'teiji'
    check (period in ('teiji', 'hannichi', 'zangyo', 'hayade', 'yakin', 'hourly')),
  start_time time not null,
  end_time time not null,
  break_minutes integer not null default 60 check (break_minutes between 0 and 480),
  -- Hours worked (minutes, CLAUDE.md rule 7); used by "por hora".
  worked_minutes integer not null default 480 check (worked_minutes between 0 and 1440),
  overtime_minutes integer not null default 0 check (overtime_minutes between 0 and 1440),
  chain_id uuid references public.client_chain (id),
  site_id uuid references public.site (id),
  day_rate bigint not null default 0 check (day_rate between 0 and 10000000),
  tax_rate smallint not null default 10 check (tax_rate in (0, 8, 10)),
  price_includes_tax boolean not null default false,
  meeting_place text check (char_length(meeting_place) <= 200),
  meeting_time time,
  -- Extra of the day for the client (charged) and for the employee (paid).
  client_extra_description text check (char_length(client_extra_description) <= 60),
  client_extra_amount bigint not null default 0 check (client_extra_amount between 0 and 1000000),
  client_extra_taxable boolean not null default false,
  employee_extra_description text check (char_length(employee_extra_description) <= 60),
  employee_extra_amount bigint not null default 0 check (employee_extra_amount between 0 and 1000000),
  -- Fine: deducted from the employee only; never on the 請求書 (R06-10).
  fine_description text check (char_length(fine_description) <= 60),
  fine_amount bigint not null default 0 check (fine_amount between 0 and 1000000),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check (start_time <> end_time)
);

create unique index assignment_day_key on public.assignment_day (assignment_id, employee_id, day)
  where deleted_at is null;
create index assignment_day_company_idx on public.assignment_day (company_id, day);
create index assignment_day_employee_idx on public.assignment_day (company_id, employee_id, day);

call app.add_standard_triggers('public.assignment_day', 'company');

alter table public.assignment_day enable row level security;
grant select on public.assignment_day to authenticated;
create policy office_read on public.assignment_day for select to authenticated
  using (app.has_role(company_id, array['owner', 'manager', 'coordinator']) and public.has_module(company_id, 'scheduling'));

-- The allocations of version 1 become days (work days as pending, the others as 休).
insert into public.assignment_day (
  company_id, assignment_id, employee_id, day, status, start_time, end_time, break_minutes,
  chain_id, site_id, meeting_place, meeting_time
)
select m.company_id, m.assignment_id, m.employee_id, d::date,
       case when extract(isodow from d)::smallint = any (a.work_days) then 'pending' else 'off' end,
       a.start_time, a.end_time, a.break_minutes, a.chain_id, a.site_id, a.meeting_place, a.meeting_time
from public.assignment_member m
join public.assignment a on a.id = m.assignment_id and a.deleted_at is null
cross join lateral generate_series(m.starts_on, m.ends_on, interval '1 day') d
where m.deleted_at is null;

-- ---------------------------------------------------------------------------
-- Version 1 functions replaced below
-- ---------------------------------------------------------------------------

drop function public.add_assignment_member(jsonb);
drop function public.remove_assignment_member(uuid, uuid, integer);
drop function public.calendar_days(uuid, date, date, uuid);
drop function app.find_overlap(uuid, uuid, uuid, date, date);
drop function public.save_assignment(jsonb);

-- R06-02: the same employee may work two stretches on a date only if their hours do not overlap.
-- Returns the first conflicting day of the employee on that date in another assignment, or null.
create function app.find_day_overlap(
  p_company_id uuid, p_employee_id uuid, p_assignment_id uuid, p_day date, p_start time, p_end time
) returns uuid
language sql stable set search_path = ''
as $$
  select o.id
  from public.assignment_day o
  cross join lateral app.shift_bounds(o.start_time, o.end_time) ob
  cross join lateral app.shift_bounds(p_start, p_end) mb
  where o.company_id = p_company_id and o.employee_id = p_employee_id and o.day = p_day
    and o.assignment_id <> p_assignment_id and o.deleted_at is null and o.status <> 'off'
    and mb.from_min < ob.to_min and ob.from_min < mb.to_min
  limit 1
$$;

-- p = { id, company_id, version?, client_id, chain_id, site_id, title, title_show_on, starts_on,
--       ends_on, start_time, end_time, break_minutes, meeting_place, meeting_time, day_rate,
--       tax_rate, price_includes_tax, extra_description, extra_client_amount,
--       extra_employee_amount, extra_client_taxable, note }
-- Creates with the id from the screen (a retry returns the same row) or edits with `version`.
-- Editing changes the defaults only: days already created keep their own values (R06-08).
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
  v_extra text := nullif(trim(p ->> 'extra_description'), '');
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
  if v_ends - v_starts > 30 then
    perform app.raise('validation', 'period_too_long');
  end if;

  select * into existing from public.assignment a where a.id = v_id for update;
  if existing.id is not null and (existing.company_id <> v_company or existing.deleted_at is not null) then
    perform app.raise('not_found', 'assignment_not_found');
  end if;

  if existing.id is null then
    insert into public.assignment (
      id, company_id, client_id, chain_id, site_id, title, title_show_on, starts_on, ends_on,
      start_time, end_time, break_minutes, meeting_place, meeting_time, note, day_rate, tax_rate,
      price_includes_tax, extra_description, extra_client_amount, extra_employee_amount,
      extra_client_taxable
    ) values (
      v_id, v_company, v_client, v_chain, v_site, nullif(trim(p ->> 'title'), ''),
      coalesce(p ->> 'title_show_on', 'both'), v_starts, v_ends,
      (p ->> 'start_time')::time, (p ->> 'end_time')::time, coalesce((p ->> 'break_minutes')::integer, 60),
      nullif(trim(p ->> 'meeting_place'), ''), nullif(p ->> 'meeting_time', '')::time,
      nullif(trim(p ->> 'note'), ''), coalesce((p ->> 'day_rate')::bigint, 0),
      coalesce((p ->> 'tax_rate')::smallint, 10), coalesce((p ->> 'price_includes_tax')::boolean, false),
      v_extra,
      case when v_extra is null then 0 else coalesce((p ->> 'extra_client_amount')::bigint, 0) end,
      case when v_extra is null then 0 else coalesce((p ->> 'extra_employee_amount')::bigint, 0) end,
      v_extra is not null and coalesce((p ->> 'extra_client_taxable')::boolean, false)
    ) returning * into saved;
  else
    if (p ->> 'version') is null then
      return to_jsonb(existing); -- retry of the creation that already succeeded
    end if;
    if existing.version <> (p ->> 'version')::integer then
      perform app.raise('conflict', 'concurrent_update');
    end if;
    -- R06-03: the days must stay inside the period.
    if exists (select 1 from public.assignment_day d
               where d.assignment_id = v_id and d.deleted_at is null
                 and (d.day < v_starts or d.day > v_ends)) then
      perform app.raise('validation', 'members_outside_period');
    end if;
    update public.assignment set
      client_id = v_client, chain_id = v_chain, site_id = v_site, title = nullif(trim(p ->> 'title'), ''),
      title_show_on = coalesce(p ->> 'title_show_on', existing.title_show_on),
      starts_on = v_starts, ends_on = v_ends,
      start_time = (p ->> 'start_time')::time, end_time = (p ->> 'end_time')::time,
      break_minutes = coalesce((p ->> 'break_minutes')::integer, existing.break_minutes),
      meeting_place = nullif(trim(p ->> 'meeting_place'), ''),
      meeting_time = nullif(p ->> 'meeting_time', '')::time, note = nullif(trim(p ->> 'note'), ''),
      day_rate = coalesce((p ->> 'day_rate')::bigint, existing.day_rate),
      tax_rate = coalesce((p ->> 'tax_rate')::smallint, existing.tax_rate),
      price_includes_tax = coalesce((p ->> 'price_includes_tax')::boolean, existing.price_includes_tax),
      extra_description = v_extra,
      extra_client_amount = case when v_extra is null then 0 else coalesce((p ->> 'extra_client_amount')::bigint, 0) end,
      extra_employee_amount = case when v_extra is null then 0 else coalesce((p ->> 'extra_employee_amount')::bigint, 0) end,
      extra_client_taxable = v_extra is not null and coalesce((p ->> 'extra_client_taxable')::boolean, false)
    where id = v_id
    returning * into saved;
  end if;
  return to_jsonb(saved);
end
$$;

-- Logical deletion of an assignment and its days (CLAUDE.md rule 5).
create function public.delete_assignment(p_company_id uuid, p_id uuid, p_version integer)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  existing public.assignment;
begin
  perform app.require_company_write(p_company_id, 'scheduling', array['owner', 'manager', 'coordinator']);
  select * into existing from public.assignment a
  where a.id = p_id and a.company_id = p_company_id and a.deleted_at is null
  for update;
  if existing.id is null then
    perform app.raise('not_found', 'assignment_not_found');
  end if;
  if existing.version <> p_version then
    perform app.raise('conflict', 'concurrent_update');
  end if;
  update public.assignment_day set deleted_at = now()
  where assignment_id = p_id and deleted_at is null;
  update public.assignment set deleted_at = now() where id = p_id;
end
$$;

-- p = { company_id, assignment_id, employee_id, starts_on?, ends_on? }
-- Puts an employee on the days of an assignment (the whole period without dates, or one day with
-- starts_on = ends_on). Each new day starts as pending with the assignment defaults (R06-07). Days
-- the employee already has are kept, so sending the same request again is harmless. Refuses hours
-- that overlap another assignment on the same date (R06-02).
create function public.add_assignment_employee(p jsonb) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_company uuid := (p ->> 'company_id')::uuid;
  v_employee uuid := (p ->> 'employee_id')::uuid;
  asg public.assignment;
  v_from date;
  v_to date;
  d date;
  overlap uuid;
  added integer := 0;
begin
  perform app.require_company_write(v_company, 'scheduling', array['owner', 'manager', 'coordinator']);

  select * into asg from public.assignment a
  where a.id = (p ->> 'assignment_id')::uuid and a.company_id = v_company and a.deleted_at is null
  for update;
  if asg.id is null then
    perform app.raise('not_found', 'assignment_not_found');
  end if;
  if not exists (select 1 from public.employee e
                 where e.id = v_employee and e.company_id = v_company
                   and e.deleted_at is null and e.status = 'active') then
    perform app.raise('not_found', 'employee_not_found');
  end if;

  v_from := coalesce(nullif(p ->> 'starts_on', '')::date, asg.starts_on);
  v_to := coalesce(nullif(p ->> 'ends_on', '')::date, asg.ends_on);
  if v_from < asg.starts_on or v_to > asg.ends_on or v_to < v_from then
    perform app.raise('validation', 'member_outside_period');
  end if;

  for d in select g::date from generate_series(v_from, v_to, interval '1 day') g loop
    continue when exists (select 1 from public.assignment_day x
                          where x.assignment_id = asg.id and x.employee_id = v_employee
                            and x.day = d and x.deleted_at is null);
    overlap := app.find_day_overlap(v_company, v_employee, asg.id, d, asg.start_time, asg.end_time);
    if overlap is not null then
      perform app.raise('conflict', 'schedule_overlap:' || d);
    end if;
    insert into public.assignment_day (
      company_id, assignment_id, employee_id, day, start_time, end_time, break_minutes, chain_id,
      site_id, day_rate, tax_rate, price_includes_tax, meeting_place, meeting_time,
      client_extra_description, client_extra_amount, client_extra_taxable,
      employee_extra_description, employee_extra_amount
    ) values (
      v_company, asg.id, v_employee, d, asg.start_time, asg.end_time, asg.break_minutes, asg.chain_id,
      asg.site_id, asg.day_rate, asg.tax_rate, asg.price_includes_tax, asg.meeting_place, asg.meeting_time,
      asg.extra_description, asg.extra_client_amount, asg.extra_client_taxable,
      asg.extra_description, asg.extra_employee_amount
    );
    added := added + 1;
  end loop;
  return added;
end
$$;

-- p = { id, company_id, version, status, period, start_time, end_time, break_minutes,
--       worked_minutes, overtime_minutes, chain_id, site_id, day_rate, tax_rate,
--       price_includes_tax, meeting_place, meeting_time, client_extra_description,
--       client_extra_amount, client_extra_taxable, employee_extra_description,
--       employee_extra_amount, fine_description, fine_amount, note }
-- Edits everything of one day of one employee (R06-08), with `version`.
create function public.save_assignment_day(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_company uuid := (p ->> 'company_id')::uuid;
  v_chain uuid := nullif(p ->> 'chain_id', '')::uuid;
  v_site uuid := nullif(p ->> 'site_id', '')::uuid;
  v_client_extra text := nullif(trim(p ->> 'client_extra_description'), '');
  v_employee_extra text := nullif(trim(p ->> 'employee_extra_description'), '');
  v_fine text := nullif(trim(p ->> 'fine_description'), '');
  existing public.assignment_day;
  asg public.assignment;
  saved public.assignment_day;
begin
  perform app.require_company_write(v_company, 'scheduling', array['owner', 'manager', 'coordinator']);
  select * into existing from public.assignment_day d
  where d.id = (p ->> 'id')::uuid and d.company_id = v_company and d.deleted_at is null
  for update;
  if existing.id is null then
    perform app.raise('not_found', 'day_not_found');
  end if;
  if existing.version <> (p ->> 'version')::integer then
    perform app.raise('conflict', 'concurrent_update');
  end if;
  select * into asg from public.assignment a where a.id = existing.assignment_id;

  if v_chain is not null and not exists (
    select 1 from public.client_chain c
    where c.id = v_chain and c.client_id = asg.client_id and c.company_id = v_company and c.deleted_at is null
  ) then
    perform app.raise('validation', 'chain_not_of_client');
  end if;
  if v_site is not null and not exists (
    select 1 from public.site s
    where s.id = v_site and s.company_id = v_company and s.deleted_at is null
      and (s.client_id is null or s.client_id = asg.client_id)
  ) then
    perform app.raise('validation', 'site_not_of_client');
  end if;
  if coalesce(p ->> 'status', existing.status) <> 'off' and app.find_day_overlap(
    v_company, existing.employee_id, existing.assignment_id, existing.day,
    (p ->> 'start_time')::time, (p ->> 'end_time')::time
  ) is not null then
    perform app.raise('conflict', 'schedule_overlap:' || existing.day);
  end if;

  update public.assignment_day set
    status = coalesce(p ->> 'status', existing.status), period = coalesce(p ->> 'period', existing.period),
    start_time = (p ->> 'start_time')::time, end_time = (p ->> 'end_time')::time,
    break_minutes = coalesce((p ->> 'break_minutes')::integer, existing.break_minutes),
    worked_minutes = coalesce((p ->> 'worked_minutes')::integer, existing.worked_minutes),
    overtime_minutes = coalesce((p ->> 'overtime_minutes')::integer, 0),
    chain_id = v_chain, site_id = v_site,
    day_rate = coalesce((p ->> 'day_rate')::bigint, existing.day_rate),
    tax_rate = coalesce((p ->> 'tax_rate')::smallint, existing.tax_rate),
    price_includes_tax = coalesce((p ->> 'price_includes_tax')::boolean, existing.price_includes_tax),
    meeting_place = nullif(trim(p ->> 'meeting_place'), ''),
    meeting_time = nullif(p ->> 'meeting_time', '')::time,
    client_extra_description = v_client_extra,
    client_extra_amount = case when v_client_extra is null then 0 else coalesce((p ->> 'client_extra_amount')::bigint, 0) end,
    client_extra_taxable = v_client_extra is not null and coalesce((p ->> 'client_extra_taxable')::boolean, false),
    employee_extra_description = v_employee_extra,
    employee_extra_amount = case when v_employee_extra is null then 0 else coalesce((p ->> 'employee_extra_amount')::bigint, 0) end,
    fine_description = v_fine,
    fine_amount = case when v_fine is null then 0 else coalesce((p ->> 'fine_amount')::bigint, 0) end,
    note = nullif(trim(p ->> 'note'), '')
  where id = existing.id
  returning * into saved;
  return to_jsonb(saved);
end
$$;

-- "Todos teiji" / "Todos folga" of one day of an assignment. Teiji marks the not-off days as worked
-- (定時, no overtime); folga marks every day as 休. Returns the number of days changed.
create function public.set_assignment_day_status(
  p_company_id uuid, p_assignment_id uuid, p_day date, p_status text
) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  changed integer;
begin
  perform app.require_company_write(p_company_id, 'scheduling', array['owner', 'manager', 'coordinator']);
  if p_status not in ('teiji', 'off') then
    perform app.raise('validation', 'status_invalid');
  end if;
  if not exists (select 1 from public.assignment a
                 where a.id = p_assignment_id and a.company_id = p_company_id and a.deleted_at is null) then
    perform app.raise('not_found', 'assignment_not_found');
  end if;
  if p_status = 'teiji' then
    update public.assignment_day set status = 'work', period = 'teiji', overtime_minutes = 0, worked_minutes = 480
    where assignment_id = p_assignment_id and company_id = p_company_id and day = p_day
      and deleted_at is null;
  else
    update public.assignment_day set status = 'off', overtime_minutes = 0
    where assignment_id = p_assignment_id and company_id = p_company_id and day = p_day
      and deleted_at is null;
  end if;
  get diagnostics changed = row_count;
  return changed;
end
$$;

-- Removes one day of an employee, or every day of the employee in the assignment when p_day_id is
-- null (logical deletion).
create function public.remove_assignment_employee(
  p_company_id uuid, p_assignment_id uuid, p_employee_id uuid, p_day_id uuid default null
) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  changed integer;
begin
  perform app.require_company_write(p_company_id, 'scheduling', array['owner', 'manager', 'coordinator']);
  update public.assignment_day set deleted_at = now()
  where company_id = p_company_id and assignment_id = p_assignment_id and employee_id = p_employee_id
    and (p_day_id is null or id = p_day_id) and deleted_at is null;
  get diagnostics changed = row_count;
  if changed = 0 then
    perform app.raise('not_found', 'day_not_found');
  end if;
  return changed;
end
$$;

revoke execute on function
  public.save_assignment(jsonb), public.delete_assignment(uuid, uuid, integer),
  public.add_assignment_employee(jsonb), public.save_assignment_day(jsonb),
  public.set_assignment_day_status(uuid, uuid, date, text),
  public.remove_assignment_employee(uuid, uuid, uuid, uuid)
from public, anon;
grant execute on function
  public.save_assignment(jsonb), public.delete_assignment(uuid, uuid, integer),
  public.add_assignment_employee(jsonb), public.save_assignment_day(jsonb),
  public.set_assignment_day_status(uuid, uuid, date, text),
  public.remove_assignment_employee(uuid, uuid, uuid, uuid)
to authenticated;
