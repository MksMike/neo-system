-- Layer 05: the daily wage of the employee (diária), in integer yen (CLAUDE.md rule 2).
-- The employee is paid by it: hourly value = day_wage / 8; overtime = hourly x 1.25 (layer 10).
-- Levantamento: docs/camadas/06-rascunho-fluxo-completo.md, 1.6.

alter table public.employee
  add column day_wage bigint not null default 0 check (day_wage between 0 and 1000000);

-- p = { ..., day_wage }: the same function, now saving the daily wage.
create or replace function public.save_employee(p jsonb) returns jsonb
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
      id, company_id, full_name, name_kana, employment_type, nationality, mobile_phone, hire_date, note,
      day_wage
    ) values (
      v_id, v_company, trim(p ->> 'full_name'), nullif(trim(p ->> 'name_kana'), ''),
      p ->> 'employment_type', nullif(p ->> 'nationality', ''), nullif(p ->> 'mobile_phone', ''),
      nullif(p ->> 'hire_date', '')::date, nullif(trim(p ->> 'note'), ''),
      coalesce((p ->> 'day_wage')::bigint, 0)
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
      note = nullif(trim(p ->> 'note'), ''),
      day_wage = coalesce((p ->> 'day_wage')::bigint, existing.day_wage)
    where id = v_id
    returning * into saved;
  end if;
  return to_jsonb(saved);
end
$$;
