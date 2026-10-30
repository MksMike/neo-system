-- Layer 06, panel 2: bulk editing of the days of an assignment over a selected period (R06-11).
-- The screen sends the selected days with the version it saw: if any changed meanwhile, nothing is
-- applied (optimistic concurrency, ADR 0020).

-- p = { company_id, assignment_id, days: [{ id, version }], set: { status?, period?,
--       overtime_minutes?, start_time?, end_time?, chain_id?, site_id?, day_rate?, tax_rate?,
--       price_includes_tax?, client_extra_description?, client_extra_amount?,
--       client_extra_taxable?, employee_extra_description?, employee_extra_amount? } }
-- Only the keys present in `set` change. Returns the number of days changed.
create function public.bulk_update_assignment_days(p jsonb) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_company uuid := (p ->> 'company_id')::uuid;
  s jsonb := coalesce(p -> 'set', '{}');
  v_chain uuid := nullif(s ->> 'chain_id', '')::uuid;
  v_site uuid := nullif(s ->> 'site_id', '')::uuid;
  asg public.assignment;
  item jsonb;
  d public.assignment_day;
  saved public.assignment_day;
  changed integer := 0;
begin
  perform app.require_company_write(v_company, 'scheduling', array['owner', 'manager', 'coordinator']);
  select * into asg from public.assignment a
  where a.id = (p ->> 'assignment_id')::uuid and a.company_id = v_company and a.deleted_at is null;
  if asg.id is null then
    perform app.raise('not_found', 'assignment_not_found');
  end if;
  if jsonb_typeof(p -> 'days') <> 'array' or jsonb_array_length(p -> 'days') = 0 then
    perform app.raise('validation', 'days_required');
  end if;
  if jsonb_array_length(p -> 'days') > 2000 then
    perform app.raise('validation', 'too_many_days');
  end if;
  if s ? 'status' and s ->> 'status' not in ('pending', 'work', 'off') then
    perform app.raise('validation', 'status_invalid');
  end if;
  if v_chain is not null and not exists (
    select 1 from public.client_chain c
    where c.id = v_chain and c.client_id = asg.client_id and c.company_id = v_company and c.deleted_at is null
  ) then
    perform app.raise('validation', 'chain_not_of_client');
  end if;
  if v_site is not null and not exists (
    select 1 from public.site st
    where st.id = v_site and st.company_id = v_company and st.deleted_at is null
      and (st.client_id is null or st.client_id = asg.client_id)
  ) then
    perform app.raise('validation', 'site_not_of_client');
  end if;

  for item in select * from jsonb_array_elements(p -> 'days') loop
    select * into d from public.assignment_day x
    where x.id = (item ->> 'id')::uuid and x.company_id = v_company and x.assignment_id = asg.id
      and x.deleted_at is null
    for update;
    if d.id is null then
      perform app.raise('not_found', 'day_not_found');
    end if;
    if d.version <> (item ->> 'version')::integer then
      perform app.raise('conflict', 'concurrent_update');
    end if;

    update public.assignment_day set
      status = case when s ? 'status' then s ->> 'status' else status end,
      period = case when s ? 'period' then s ->> 'period' else period end,
      worked_minutes = case when s ? 'period' then
          case s ->> 'period' when 'hannichi' then 240 else worked_minutes end
        else worked_minutes end,
      overtime_minutes = case
          when coalesce(s ->> 'status', status) <> 'work' then 0
          when s ? 'overtime_minutes' then (s ->> 'overtime_minutes')::integer
          else overtime_minutes end,
      start_time = case when s ? 'start_time' then (s ->> 'start_time')::time else start_time end,
      end_time = case when s ? 'end_time' then (s ->> 'end_time')::time else end_time end,
      chain_id = case when s ? 'chain_id' then v_chain else chain_id end,
      site_id = case when s ? 'site_id' then v_site else site_id end,
      day_rate = case when s ? 'day_rate' then (s ->> 'day_rate')::bigint else day_rate end,
      tax_rate = case when s ? 'tax_rate' then (s ->> 'tax_rate')::smallint else tax_rate end,
      price_includes_tax = case when s ? 'price_includes_tax' then (s ->> 'price_includes_tax')::boolean
        else price_includes_tax end,
      client_extra_description = case when s ? 'client_extra_description'
        then nullif(trim(s ->> 'client_extra_description'), '') else client_extra_description end,
      client_extra_amount = case when s ? 'client_extra_description' then
          case when nullif(trim(s ->> 'client_extra_description'), '') is null then 0
               else coalesce((s ->> 'client_extra_amount')::bigint, 0) end
        else client_extra_amount end,
      client_extra_taxable = case when s ? 'client_extra_description' then
          nullif(trim(s ->> 'client_extra_description'), '') is not null
          and coalesce((s ->> 'client_extra_taxable')::boolean, false)
        else client_extra_taxable end,
      employee_extra_description = case when s ? 'employee_extra_description'
        then nullif(trim(s ->> 'employee_extra_description'), '') else employee_extra_description end,
      employee_extra_amount = case when s ? 'employee_extra_description' then
          case when nullif(trim(s ->> 'employee_extra_description'), '') is null then 0
               else coalesce((s ->> 'employee_extra_amount')::bigint, 0) end
        else employee_extra_amount end
    where id = d.id
    returning * into saved;

    -- R06-02 still holds after the change.
    if saved.status <> 'off' and app.find_day_overlap(
      v_company, saved.employee_id, saved.assignment_id, saved.day, saved.start_time, saved.end_time
    ) is not null then
      perform app.raise('conflict', 'schedule_overlap:' || saved.day);
    end if;
    changed := changed + 1;
  end loop;
  return changed;
end
$$;

-- p = { company_id, assignment_id, days: [{ id, version }] }: removes the selected days (logical).
create function public.remove_assignment_days(p jsonb) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_company uuid := (p ->> 'company_id')::uuid;
  item jsonb;
  d public.assignment_day;
  changed integer := 0;
begin
  perform app.require_company_write(v_company, 'scheduling', array['owner', 'manager', 'coordinator']);
  if jsonb_typeof(p -> 'days') <> 'array' or jsonb_array_length(p -> 'days') = 0 then
    perform app.raise('validation', 'days_required');
  end if;
  for item in select * from jsonb_array_elements(p -> 'days') loop
    select * into d from public.assignment_day x
    where x.id = (item ->> 'id')::uuid and x.company_id = v_company
      and x.assignment_id = (p ->> 'assignment_id')::uuid and x.deleted_at is null
    for update;
    if d.id is null then
      perform app.raise('not_found', 'day_not_found');
    end if;
    if d.version <> (item ->> 'version')::integer then
      perform app.raise('conflict', 'concurrent_update');
    end if;
    update public.assignment_day set deleted_at = now() where id = d.id;
    changed := changed + 1;
  end loop;
  return changed;
end
$$;

revoke execute on function public.bulk_update_assignment_days(jsonb), public.remove_assignment_days(jsonb)
from public, anon;
grant execute on function public.bulk_update_assignment_days(jsonb), public.remove_assignment_days(jsonb)
to authenticated;
