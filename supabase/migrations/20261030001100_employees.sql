-- Layer 05: employees (demonstration fields, ADR 0025) and the app access by ID + PIN (ADR 0016).

create table public.employee (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  -- The record exists without a login; filled when the app access is created (ADR 0016).
  user_id uuid references auth.users (id),
  full_name text not null check (char_length(full_name) between 1 and 100),
  name_kana text check (char_length(name_kana) <= 100),
  -- 社員, パート, 下請 (person), 業務委託 (freelancer): docs/00-ancora.md, glossary "Vínculo".
  employment_type text not null check (employment_type in ('regular', 'part_time', 'subcontractor', 'freelancer')),
  nationality text check (nationality ~ '^[A-Z]{2}$'),
  mobile_phone text check (mobile_phone ~ '^0[789]0[0-9]{8}$'),
  hire_date date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

create index employee_company_idx on public.employee (company_id, full_name);
-- One employee record per login in each company.
create unique index employee_user_key on public.employee (company_id, user_id)
  where user_id is not null and deleted_at is null;

call app.add_standard_triggers('public.employee', 'company');

alter table public.employee enable row level security;
grant select on public.employee to authenticated;

-- Office roles read the company employees (the coordinator needs them to assign); an employee
-- reads only their own record (the app, D-05).
create policy office_read on public.employee for select to authenticated
  using (app.has_role(company_id, array['owner', 'manager', 'coordinator']) and public.has_module(company_id, 'employees'));
create policy own_read on public.employee for select to authenticated
  using (user_id = app.current_user_id() and deleted_at is null);

-- ---------------------------------------------------------------------------
-- Registration
-- ---------------------------------------------------------------------------

-- p = { id, company_id, version?, full_name, name_kana, employment_type, nationality, mobile_phone,
--       hire_date, status, note }
-- Creates with the id from the screen (a retry returns the same row) or edits with `version`.
create function public.save_employee(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := (p ->> 'id')::uuid;
  v_company uuid := (p ->> 'company_id')::uuid;
  existing public.employee;
  saved public.employee;
begin
  perform app.require_company_write(v_company, 'employees', array['owner', 'manager']);
  if nullif(trim(p ->> 'full_name'), '') is null then
    perform app.raise('validation', 'full_name_required');
  end if;

  select * into existing from public.employee e where e.id = v_id for update;
  if existing.id is not null and (existing.company_id <> v_company or existing.deleted_at is not null) then
    perform app.raise('not_found', 'employee_not_found');
  end if;

  if existing.id is null then
    insert into public.employee (
      id, company_id, full_name, name_kana, employment_type, nationality, mobile_phone, hire_date, note
    ) values (
      v_id, v_company, trim(p ->> 'full_name'), nullif(trim(p ->> 'name_kana'), ''),
      p ->> 'employment_type', nullif(p ->> 'nationality', ''), nullif(p ->> 'mobile_phone', ''),
      nullif(p ->> 'hire_date', '')::date, nullif(trim(p ->> 'note'), '')
    ) returning * into saved;
  else
    if (p ->> 'version') is null then
      return to_jsonb(existing); -- retry of the creation that already succeeded
    end if;
    if existing.version <> (p ->> 'version')::integer then
      perform app.raise('conflict', 'concurrent_update');
    end if;
    update public.employee set
      full_name = trim(p ->> 'full_name'),
      name_kana = nullif(trim(p ->> 'name_kana'), ''),
      employment_type = p ->> 'employment_type',
      nationality = nullif(p ->> 'nationality', ''),
      mobile_phone = nullif(p ->> 'mobile_phone', ''),
      hire_date = nullif(p ->> 'hire_date', '')::date,
      status = coalesce(nullif(p ->> 'status', ''), existing.status),
      note = nullif(trim(p ->> 'note'), '')
    where id = v_id
    returning * into saved;
  end if;
  return to_jsonb(saved);
end
$$;

-- ---------------------------------------------------------------------------
-- App access by ID + PIN (ADR 0016)
-- ---------------------------------------------------------------------------

-- Step 1, as the signed-in office user: checks the right to create or reset the access and
-- returns the current login, if any. The server then creates or updates the technical login.
create function public.begin_employee_access(p_company_id uuid, p_employee_id uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  emp public.employee;
begin
  perform app.require_company_write(p_company_id, 'employees', array['owner', 'manager']);
  select * into emp from public.employee e
  where e.id = p_employee_id and e.company_id = p_company_id and e.deleted_at is null;
  if emp.id is null then
    perform app.raise('not_found', 'employee_not_found');
  end if;
  if emp.status <> 'active' then
    perform app.raise('validation', 'employee_inactive');
  end if;
  return jsonb_build_object(
    'employee_id', emp.id,
    'full_name', emp.full_name,
    'user_id', emp.user_id,
    'login_id', (select p.employee_login_id from public.user_profile p where p.user_id = emp.user_id)
  );
end
$$;

-- Step 2, by the server only (service_role): links the technical login to the employee, with the
-- profile (login kind and ID) and the employee membership. On a PIN reset, ends every session of
-- that login (ADR 0016, item 8). Always filters the company explicitly (CLAUDE.md, rule 1).
create function public.finish_employee_access(
  p_company_id uuid,
  p_employee_id uuid,
  p_user_id uuid,
  p_login_id text,
  p_reset boolean default false
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  emp public.employee;
begin
  if p_login_id is null or p_login_id !~ '^[0-9]{8}$' then
    perform app.raise('validation', 'login_id_invalid');
  end if;
  select * into emp from public.employee e
  where e.id = p_employee_id and e.company_id = p_company_id and e.deleted_at is null
  for update;
  if emp.id is null then
    perform app.raise('not_found', 'employee_not_found');
  end if;
  if emp.user_id is not null and emp.user_id <> p_user_id then
    perform app.raise('conflict', 'employee_has_other_login');
  end if;

  update public.employee set user_id = p_user_id where id = emp.id and user_id is null;

  insert into public.user_profile (user_id, display_name, login_kind, employee_login_id)
  values (p_user_id, emp.full_name, 'pin', p_login_id)
  on conflict on constraint user_profile_user_id_key
  do update set login_kind = 'pin', employee_login_id = excluded.employee_login_id;

  insert into public.membership (user_id, company_id, role)
  select p_user_id, p_company_id, 'employee'
  where not exists (
    select 1 from public.membership m
    where m.user_id = p_user_id and m.company_id = p_company_id and m.deleted_at is null
  );

  if p_reset then
    delete from auth.refresh_tokens where user_id = p_user_id::text;
    delete from auth.sessions where user_id = p_user_id;
  end if;
end
$$;

-- The 8-digit IDs of employees, for the office of their company (the profile itself is private).
create function public.employee_login_ids(p_user_ids uuid[])
returns table (user_id uuid, login_id text)
language sql stable security definer set search_path = ''
as $$
  select p.user_id, p.employee_login_id
  from public.user_profile p
  where p.user_id = any (p_user_ids)
    and p.employee_login_id is not null
    and exists (
      select 1 from public.employee e
      where e.user_id = p.user_id and e.deleted_at is null
        and app.has_role(e.company_id, array['owner', 'manager', 'coordinator'])
    )
$$;

revoke execute on function public.employee_login_ids(uuid[]) from public, anon;
grant execute on function public.employee_login_ids(uuid[]) to authenticated;

revoke execute on function
  public.save_employee(jsonb), public.begin_employee_access(uuid, uuid),
  public.finish_employee_access(uuid, uuid, uuid, text, boolean)
from public, anon;
grant execute on function public.save_employee(jsonb), public.begin_employee_access(uuid, uuid) to authenticated;
grant execute on function public.finish_employee_access(uuid, uuid, uuid, text, boolean) to service_role;
