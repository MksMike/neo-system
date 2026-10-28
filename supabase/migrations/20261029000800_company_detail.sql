-- Company page (SA-09): module and contract changes with optimistic concurrency (ADR 0020).
-- The screen sends what it saw; if someone changed it meanwhile, the change is refused with
-- `conflict` instead of silently overwriting.

-- ---------------------------------------------------------------------------
-- Modules: p_expected = the optional modules the screen showed (open periods)
-- ---------------------------------------------------------------------------

drop function public.set_company_modules(uuid, text[], date);

create function public.set_company_modules(
  p_company_id uuid,
  p_module_keys text[],
  p_valid_from date default null,
  p_expected text[] default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_valid_from date := coalesce(p_valid_from, app.today());
  current_keys text[];
  result jsonb;
begin
  perform app.require_platform_admin();
  if not exists (select 1 from public.company c where c.id = p_company_id and c.deleted_at is null and c.status <> 'canceled') then
    perform app.raise('not_found', 'company_not_found');
  end if;
  if v_valid_from < app.today() then
    perform app.raise('validation', 'valid_from_in_the_past'); -- R00-05: the past is not rewritten
  end if;

  -- Lock the company row: two changes to the same company run one after the other.
  perform 1 from public.company c where c.id = p_company_id for update;
  if p_expected is not null then
    select coalesce(array_agg(cm.module_key order by cm.module_key), '{}') into current_keys
    from public.company_module cm
    where cm.company_id = p_company_id and cm.valid_to is null and cm.deleted_at is null;
    if current_keys <> (select coalesce(array_agg(k order by k), '{}') from unnest(p_expected) k) then
      perform app.raise('conflict', 'modules_changed');
    end if;
  end if;

  result := app.apply_modules(p_company_id, p_module_keys, v_valid_from);
  perform app.log_platform_action('company.modules_changed', p_company_id,
    result || jsonb_build_object('valid_from', v_valid_from));
  return result;
end
$$;

-- ---------------------------------------------------------------------------
-- Contract: p_expected_contract_id = the current contract the screen showed
-- ---------------------------------------------------------------------------

drop function public.change_contract(uuid, jsonb, date);

create function public.change_contract(
  p_company_id uuid,
  p jsonb,
  p_valid_from date default null,
  p_expected_contract_id uuid default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_valid_from date := coalesce(p_valid_from, app.today());
  previous public.contract;
  ct public.contract;
  v_contract_id uuid;
begin
  perform app.require_platform_admin();
  if v_valid_from < app.today() then
    perform app.raise('validation', 'valid_from_in_the_past');
  end if;
  if not exists (select 1 from public.company c where c.id = p_company_id and c.deleted_at is null and c.status <> 'canceled') then
    perform app.raise('not_found', 'company_not_found');
  end if;

  select * into previous from public.contract
  where company_id = p_company_id and valid_to is null and deleted_at is null
  for update;

  if p_expected_contract_id is not null and previous.id is distinct from p_expected_contract_id then
    perform app.raise('conflict', 'contract_changed');
  end if;
  -- A version scheduled for a later date cannot be replaced from an earlier one
  -- (the same day is allowed: it replaces a version that has not been in force yet).
  if previous.id is not null and previous.valid_from > v_valid_from then
    perform app.raise('validation', 'valid_from_before_current');
  end if;

  ct := app.build_contract(p_company_id, p, v_valid_from, previous);
  if previous.id is not null then
    update public.contract set valid_to = v_valid_from - 1 where id = previous.id;
  end if;
  v_contract_id := app.insert_contract(ct);

  perform app.generate_charges_for(p_company_id, app.today());
  perform app.recompute_one(p_company_id, app.today());
  perform app.log_platform_action('contract.changed', p_company_id, jsonb_build_object(
    'previous_contract_id', previous.id, 'contract_id', v_contract_id, 'type', ct.type,
    'price_yen', ct.price_yen, 'valid_from', v_valid_from
  ));
  return v_contract_id;
end
$$;

revoke execute on function
  public.set_company_modules(uuid, text[], date, text[]),
  public.change_contract(uuid, jsonb, date, uuid)
from public, anon;
grant execute on function
  public.set_company_modules(uuid, text[], date, text[]),
  public.change_contract(uuid, jsonb, date, uuid)
to authenticated;
