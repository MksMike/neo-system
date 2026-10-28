-- Platform functions (layer 00, section 3). Every write goes through here (ADR 0023).
-- Public functions check the caller; app.* internals have no grants and run only from other functions or pg_cron.

-- ---------------------------------------------------------------------------
-- Guards
-- ---------------------------------------------------------------------------

create function app.require_platform_admin() returns void
language plpgsql stable set search_path = ''
as $$
begin
  if not app.is_platform_admin() then
    perform app.raise('forbidden', 'super_admin_with_2fa_required');
  end if;
end
$$;

create function app.log_platform_action(p_action text, p_company_id uuid, p_payload jsonb) returns void
language sql set search_path = ''
as $$
  insert into public.platform_audit_log (actor_id, action, company_id, payload)
  values (app.current_user_id(), p_action, p_company_id, coalesce(p_payload, '{}'));
$$;

create function app.enqueue_job(p_type text, p_payload jsonb, p_company_id uuid default null) returns uuid
language sql set search_path = ''
as $$
  insert into public.job (type, payload, company_id) values (p_type, coalesce(p_payload, '{}'), p_company_id)
  returning id;
$$;

-- ---------------------------------------------------------------------------
-- Modules (R00-03, R00-04, R00-05)
-- ---------------------------------------------------------------------------

create function app.module_enabled(p_company_id uuid, p_module_key text, p_on date) returns boolean
language sql stable set search_path = ''
as $$
  select exists (select 1 from public.module m where m.key = p_module_key and m.kind = 'base' and m.deleted_at is null)
    or exists (
      select 1 from public.company_module cm
      where cm.company_id = p_company_id
        and cm.module_key = p_module_key
        and cm.deleted_at is null
        and cm.valid_from <= p_on
        and (cm.valid_to is null or cm.valid_to >= p_on)
    )
$$;

-- Sets the optional modules of a company from `p_valid_from` on. Returns what is on and what
-- was turned on as a dependency. Refuses turning off a module that another one still needs.
create function app.apply_modules(p_company_id uuid, p_keys text[], p_valid_from date) returns jsonb
language plpgsql set search_path = ''
as $$
declare
  requested text[];
  desired text[];
  current_keys text[];
  added text[];
  auto_added text[] := '{}'::text[];
  removed text;
  dependents text[];
  m record;
begin
  -- Base modules are implicit; ignore them in the request.
  select coalesce(array_agg(distinct k order by k), '{}') into requested
  from unnest(coalesce(p_keys, '{}')) k
  where not exists (select 1 from public.module b where b.key = k and b.kind = 'base');

  select coalesce(array_agg(k), '{}') into added
  from unnest(requested) k
  where not exists (select 1 from public.module x where x.key = k and x.deleted_at is null);
  if cardinality(added) > 0 then
    perform app.raise('validation', 'unknown_module: ' || array_to_string(added, ', '));
  end if;

  select coalesce(array_agg(cm.module_key order by cm.module_key), '{}') into current_keys
  from public.company_module cm
  where cm.company_id = p_company_id and cm.valid_to is null and cm.deleted_at is null;

  -- R00-04: a module that stays on keeps its dependencies on.
  foreach removed in array (select coalesce(array_agg(k), '{}') from unnest(current_keys) k where k <> all (requested)) loop
    select coalesce(array_agg(x.key order by x.key), '{}') into dependents
    from public.module x
    where x.key = any (requested)
      and (removed = any (x.depends_on)
        or (removed = any (x.depends_any)
          and not exists (select 1 from unnest(x.depends_any) alt where alt <> removed and alt = any (requested))));
    if cardinality(dependents) > 0 then
      perform app.raise('conflict', 'module_has_dependents: ' || removed || ' <- ' || array_to_string(dependents, ', '));
    end if;
  end loop;

  -- R00-04: turning a module on turns its dependencies on.
  desired := requested;
  loop
    select coalesce(array_agg(distinct d), '{}') into added
    from public.module x, unnest(x.depends_on) d
    where x.key = any (desired) and d <> all (desired);
    exit when cardinality(added) = 0;
    auto_added := auto_added || added;
    desired := desired || added;
  end loop;

  for m in select x.key, x.depends_any from public.module x where x.key = any (desired) and cardinality(x.depends_any) > 0 loop
    if not (desired && m.depends_any) then
      perform app.raise('validation', 'module_requires_one_of: ' || m.key || ' -> ' || array_to_string(m.depends_any, ', '));
    end if;
  end loop;

  -- Turn off: close the open period, or drop it if it had not started yet.
  update public.company_module cm
  set deleted_at = case when cm.valid_from >= p_valid_from then now() else cm.deleted_at end,
      valid_to = case when cm.valid_from >= p_valid_from then cm.valid_to else p_valid_from - 1 end
  where cm.company_id = p_company_id and cm.valid_to is null and cm.deleted_at is null
    and cm.module_key <> all (desired);

  -- Turn on.
  insert into public.company_module (company_id, module_key, valid_from)
  select p_company_id, k, p_valid_from
  from unnest(desired) k
  where k <> all (current_keys);

  return jsonb_build_object(
    'enabled', (select coalesce(jsonb_agg(k order by k), '[]') from unnest(desired) k),
    'auto_added', (select coalesce(jsonb_agg(distinct k), '[]') from unnest(auto_added) k)
  );
end
$$;

create function public.set_company_modules(p_company_id uuid, p_module_keys text[], p_valid_from date default null)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_valid_from date := coalesce(p_valid_from, app.today());
  result jsonb;
begin
  perform app.require_platform_admin();
  if not exists (select 1 from public.company c where c.id = p_company_id and c.deleted_at is null and c.status <> 'canceled') then
    perform app.raise('not_found', 'company_not_found');
  end if;
  if v_valid_from < app.today() then
    perform app.raise('validation', 'valid_from_in_the_past'); -- R00-05: the past is not rewritten
  end if;
  result := app.apply_modules(p_company_id, p_module_keys, v_valid_from);
  perform app.log_platform_action('company.modules_changed', p_company_id,
    result || jsonb_build_object('valid_from', v_valid_from));
  return result;
end
$$;

-- ---------------------------------------------------------------------------
-- Status (R00-06, R00-12, R00-13, R00-15, R00-17, R00-20)
-- ---------------------------------------------------------------------------

-- The day of the due date still counts as on time; lateness counts from the next day.
create function app.compute_status(p_company public.company, p_contract public.contract, p_today date) returns text
language plpgsql stable set search_path = ''
as $$
declare
  days_late integer;
begin
  if p_company.canceled_on is not null and p_company.canceled_on <= p_today then
    return 'canceled';
  elsif p_company.status_locked then
    return p_company.status;
  elsif p_contract.id is null or p_contract.type = 'partner' then
    return 'active';
  elsif p_contract.trial_ends_on is not null and p_today <= p_contract.trial_ends_on then
    return 'trial';
  end if;

  days_late := p_today - (p_contract.paid_until + 1);
  if days_late <= 0 then
    return 'active';
  elsif days_late <= p_contract.grace_days then
    return 'past_due';
  elsif days_late <= p_contract.grace_days + p_contract.block_after_days then
    return 'read_only';
  end if;
  return 'blocked';
end
$$;

create function app.recompute_one(p_company_id uuid, p_today date) returns text
language plpgsql set search_path = ''
as $$
declare
  c public.company;
  ct public.contract;
  next_status text;
begin
  select * into c from public.company where id = p_company_id for update;
  select * into ct from public.contract
  where company_id = p_company_id and valid_to is null and deleted_at is null;

  next_status := app.compute_status(c, ct, p_today);
  if next_status is distinct from c.status then
    update public.company set status = next_status where id = p_company_id;
    insert into public.company_status_event (company_id, from_status, to_status, source, actor_id)
    values (p_company_id, c.status, next_status, 'auto', app.current_user_id());
  end if;
  return next_status;
end
$$;

create function app.recompute_all(p_today date) returns integer
language plpgsql set search_path = ''
as $$
declare
  changed integer := 0;
  r record;
begin
  for r in
    select c.id, c.status from public.company c
    where c.deleted_at is null and c.status <> 'canceled'
  loop
    if app.recompute_one(r.id, p_today) is distinct from r.status then
      changed := changed + 1;
    end if;
  end loop;
  return changed;
end
$$;

-- Manual run (the daily one is pg_cron). p_today exists for tests and corrections.
create function public.recompute_company_status(p_today date default null) returns integer
language plpgsql security definer set search_path = ''
as $$
begin
  perform app.require_platform_admin();
  return app.recompute_all(coalesce(p_today, app.today()));
end
$$;

-- ---------------------------------------------------------------------------
-- Charges (R00-14, R00-20). Paid in advance: due on the first day of the period.
-- ---------------------------------------------------------------------------

create function app.generate_charges_for(p_company_id uuid, p_today date) returns integer
language plpgsql set search_path = ''
as $$
declare
  c public.company;
  ct public.contract;
  next_start date;
  v_period_end date;
  created integer := 0;
begin
  select * into c from public.company where id = p_company_id and deleted_at is null;
  select * into ct from public.contract
  where company_id = p_company_id and valid_to is null and deleted_at is null;
  if c.id is null or ct.id is null or ct.type = 'partner' or c.status = 'canceled' then
    return 0;
  end if;

  select greatest(coalesce(max(sc.period_end) + 1, ct.billing_start), ct.billing_start) into next_start
  from public.saas_charge sc
  where sc.company_id = p_company_id and sc.deleted_at is null and sc.status <> 'canceled';

  -- ✱ R00-14: generated 10 days before the period starts (proposal awaiting confirmation).
  while next_start - 10 <= p_today and (c.canceled_on is null or next_start < c.canceled_on) loop
    v_period_end := (next_start + case ct.type when 'annual' then interval '1 year' else interval '1 month' end)::date - 1;
    insert into public.saas_charge (company_id, contract_id, period_start, period_end, due_on, amount_yen)
    values (p_company_id, ct.id, next_start, v_period_end, next_start, ct.price_yen)
    on conflict (company_id, period_start) do nothing;
    created := created + 1;
    next_start := v_period_end + 1;
  end loop;
  return created;
end
$$;

create function app.generate_all(p_today date) returns integer
language plpgsql set search_path = ''
as $$
declare
  total integer := 0;
  r record;
begin
  for r in select c.id from public.company c where c.deleted_at is null and c.status <> 'canceled' loop
    total := total + app.generate_charges_for(r.id, p_today);
  end loop;
  return total;
end
$$;

create function public.generate_saas_charges(p_today date default null) returns integer
language plpgsql security definer set search_path = ''
as $$
begin
  perform app.require_platform_admin();
  return app.generate_all(coalesce(p_today, app.today()));
end
$$;

-- ---------------------------------------------------------------------------
-- Contract helpers
-- ---------------------------------------------------------------------------

-- Validates and builds a contract row from JSON:
-- { type, price_yen, payment_method, starts_on, trial_days, grace_days, block_after_days, note }.
create function app.build_contract(p_company_id uuid, p jsonb, p_valid_from date, p_previous public.contract)
returns public.contract
language plpgsql stable set search_path = ''
as $$
declare
  ct public.contract;
  trial_days integer := coalesce((p ->> 'trial_days')::integer, 0);
begin
  ct.company_id := p_company_id;
  ct.type := p ->> 'type';
  if ct.type is null or ct.type not in ('monthly', 'annual', 'partner') then
    perform app.raise('validation', 'contract_type_invalid');
  end if;
  ct.starts_on := coalesce((p ->> 'starts_on')::date, p_valid_from);
  ct.valid_from := p_valid_from;
  ct.grace_days := coalesce((p ->> 'grace_days')::integer, 7);
  ct.block_after_days := coalesce((p ->> 'block_after_days')::integer, 15);
  ct.note := p ->> 'note';
  ct.price_yen := 0;

  if ct.type = 'partner' then
    return ct; -- R00-12: no price, no charges
  end if;

  ct.price_yen := (p ->> 'price_yen')::bigint;
  if ct.price_yen is null or ct.price_yen <= 0 then
    perform app.raise('validation', 'price_yen_required');
  end if;
  ct.payment_method := p ->> 'payment_method';
  if ct.payment_method is null or ct.payment_method not in ('transfer', 'cash') then
    perform app.raise('validation', 'payment_method_invalid'); -- R00-18
  end if;
  if trial_days < 0 or trial_days > 90 then
    perform app.raise('validation', 'trial_days_out_of_range');
  end if;
  if trial_days > 0 and p_previous.id is null then
    ct.trial_ends_on := ct.starts_on + trial_days - 1; -- R00-17
  end if;

  -- A paid contract keeps the paid cycle of the previous one; otherwise it starts on its own.
  ct.billing_start := case
    when p_previous.id is not null and p_previous.type <> 'partner' then greatest(p_previous.paid_until + 1, p_valid_from)
    else coalesce(ct.trial_ends_on + 1, ct.starts_on)
  end;
  if extract(day from ct.billing_start) > 28 then
    perform app.raise('validation', 'billing_day_over_28');
  end if;
  ct.paid_until := ct.billing_start - 1;
  return ct;
end
$$;

create function app.insert_contract(ct public.contract) returns uuid
language sql set search_path = ''
as $$
  insert into public.contract (
    company_id, type, price_yen, payment_method, starts_on, trial_ends_on, billing_start, paid_until,
    grace_days, block_after_days, valid_from, note
  ) values (
    ct.company_id, ct.type, ct.price_yen, ct.payment_method, ct.starts_on, ct.trial_ends_on, ct.billing_start,
    ct.paid_until, ct.grace_days, ct.block_after_days, ct.valid_from, ct.note
  )
  returning id;
$$;

-- ---------------------------------------------------------------------------
-- Provisioning (R00-01, R00-02, ADR 0012)
-- ---------------------------------------------------------------------------

-- p = { company: {...}, modules: [...], contract: {...}, owner: { name, email } }
-- One transaction: company, contract, modules, owner invitation (queued) and log, or nothing.
create function public.provision_company(p jsonb) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  today date := app.today();
  pc jsonb := p -> 'company';
  owner jsonb := p -> 'owner';
  company_id uuid;
  ct public.contract;
  modules_result jsonb;
  invitation_id uuid;
  v_job_id uuid;
  v_code text := upper(trim(pc ->> 'code'));
begin
  perform app.require_platform_admin();

  if pc is null or owner is null or p -> 'contract' is null then
    perform app.raise('validation', 'company_contract_owner_required');
  end if;
  if v_code is null or v_code !~ '^[A-Z0-9]{3,12}$' then
    perform app.raise('validation', 'company_code_invalid');
  end if;
  if exists (select 1 from public.company c where c.code = v_code) then
    perform app.raise('conflict', 'company_code_taken');
  end if;
  if nullif(trim(owner ->> 'email'), '') is null or nullif(trim(owner ->> 'name'), '') is null then
    perform app.raise('validation', 'owner_name_email_required');
  end if;

  insert into public.company (
    code, legal_name, legal_name_kana, display_name, invoice_reg_no, postal_code, address, phone, email,
    referred_by_company_id, default_locale
  ) values (
    v_code,
    trim(pc ->> 'legal_name'),
    nullif(trim(pc ->> 'legal_name_kana'), ''),
    coalesce(nullif(trim(pc ->> 'display_name'), ''), trim(pc ->> 'legal_name')),
    nullif(pc ->> 'invoice_reg_no', ''),
    nullif(pc ->> 'postal_code', ''),
    nullif(trim(pc ->> 'address'), ''),
    nullif(pc ->> 'phone', ''),
    nullif(lower(trim(pc ->> 'email')), ''),
    nullif(pc ->> 'referred_by_company_id', '')::uuid,
    coalesce(nullif(pc ->> 'default_locale', ''), 'ja')
  )
  returning id into company_id;

  ct := app.build_contract(company_id, p -> 'contract', today, null);
  if ct.starts_on < today then
    perform app.raise('validation', 'starts_on_in_the_past');
  end if;
  perform app.insert_contract(ct);

  modules_result := app.apply_modules(
    company_id,
    array(select jsonb_array_elements_text(coalesce(p -> 'modules', '[]'))),
    today
  );

  insert into public.owner_invitation (company_id, email, name)
  values (company_id, lower(trim(owner ->> 'email')), trim(owner ->> 'name'))
  returning id into invitation_id;
  v_job_id := app.enqueue_job('owner_invitation.send', jsonb_build_object('invitation_id', invitation_id), company_id);
  update public.owner_invitation set job_id = v_job_id where id = invitation_id;

  perform app.generate_charges_for(company_id, today);
  perform app.recompute_one(company_id, today);

  perform app.log_platform_action('company.provisioned', company_id, jsonb_build_object(
    'code', v_code, 'contract_type', ct.type, 'modules', modules_result, 'invitation_id', invitation_id
  ));
  return company_id;
end
$$;

-- ---------------------------------------------------------------------------
-- Contract change with effective date (R00-05)
-- ---------------------------------------------------------------------------

create function public.change_contract(p_company_id uuid, p jsonb, p_valid_from date default null) returns uuid
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

-- ---------------------------------------------------------------------------
-- Payments (R00-07, R00-16, R00-18)
-- ---------------------------------------------------------------------------

-- p = { paid_on, amount_yen, method, reference, receipt_path, note,
--       settlement: 'settle_with_fee' | 'leave_open' (only when the amount is short) }
create function public.register_saas_payment(p_charge_id uuid, p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  today date := app.today();
  ch public.saas_charge;
  amount bigint := (p ->> 'amount_yen')::bigint;
  paid_on date := coalesce((p ->> 'paid_on')::date, today);
  method text := p ->> 'method';
  settlement text;
  balance bigint;
  first_unpaid date;
  new_paid_until date;
  company_status text;
begin
  perform app.require_platform_admin();

  select * into ch from public.saas_charge where id = p_charge_id and deleted_at is null for update;
  if ch.id is null then
    perform app.raise('not_found', 'charge_not_found');
  end if;
  if ch.status not in ('open', 'partial') then
    perform app.raise('conflict', 'charge_not_open');
  end if;
  if amount is null or amount <= 0 then
    perform app.raise('validation', 'amount_yen_required');
  end if;
  if method is null or method not in ('transfer', 'cash') then
    perform app.raise('validation', 'payment_method_invalid');
  end if;
  if paid_on > today then
    perform app.raise('validation', 'paid_on_in_the_future');
  end if;

  balance := ch.amount_yen - ch.paid_yen - ch.fee_yen;
  if amount > balance then
    perform app.raise('validation', 'amount_exceeds_balance');
  elsif amount = balance then
    settlement := 'full';
  else
    settlement := p ->> 'settlement';
    if settlement is null or settlement not in ('settle_with_fee', 'leave_open') then
      perform app.raise('validation', 'settlement_required'); -- R00-16: the Super Admin decides
    end if;
  end if;

  insert into public.saas_payment (company_id, charge_id, paid_on, amount_yen, method, reference, receipt_path, settlement, note)
  values (ch.company_id, ch.id, paid_on, amount, method, p ->> 'reference', p ->> 'receipt_path', settlement, p ->> 'note');

  update public.saas_charge
  set paid_yen = paid_yen + amount,
      fee_yen = case when settlement = 'settle_with_fee' then balance - amount else fee_yen end,
      status = case when settlement = 'leave_open' then 'partial' else 'paid' end
  where id = ch.id;

  -- R00-07: paid until the end of the last charge with no unpaid charge before it.
  select min(sc.period_start) into first_unpaid
  from public.saas_charge sc
  where sc.company_id = ch.company_id and sc.deleted_at is null and sc.status in ('open', 'partial');

  select case
    when first_unpaid is not null then first_unpaid - 1
    else max(sc.period_end)
  end into new_paid_until
  from public.saas_charge sc
  where sc.company_id = ch.company_id and sc.deleted_at is null and sc.status = 'paid';

  update public.contract
  set paid_until = greatest(paid_until, new_paid_until)
  where company_id = ch.company_id and valid_to is null and deleted_at is null and type <> 'partner'
    and new_paid_until is not null;

  company_status := app.recompute_one(ch.company_id, today);
  perform app.log_platform_action('payment.registered', ch.company_id, jsonb_build_object(
    'charge_id', ch.id, 'amount_yen', amount, 'settlement', settlement, 'paid_on', paid_on
  ));

  return jsonb_build_object(
    'charge_status', (select status from public.saas_charge where id = ch.id),
    'paid_until', (select paid_until from public.contract
                   where company_id = ch.company_id and valid_to is null and deleted_at is null),
    'company_status', company_status
  );
end
$$;

-- ---------------------------------------------------------------------------
-- Suspend, reactivate, cancel (R00-08, R00-13, R00-20)
-- ---------------------------------------------------------------------------

create function app.require_reason(p_reason text) returns text
language plpgsql stable set search_path = ''
as $$
begin
  if nullif(trim(p_reason), '') is null then
    perform app.raise('validation', 'reason_required');
  end if;
  return trim(p_reason);
end
$$;

create function public.suspend_company(p_company_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  reason text := app.require_reason(p_reason);
  c public.company;
begin
  perform app.require_platform_admin();
  select * into c from public.company where id = p_company_id and deleted_at is null for update;
  if c.id is null then
    perform app.raise('not_found', 'company_not_found');
  end if;
  if c.status = 'canceled' then
    perform app.raise('conflict', 'company_canceled');
  end if;
  update public.company set status = 'blocked', status_locked = true, status_reason = reason where id = c.id;
  insert into public.company_status_event (company_id, from_status, to_status, reason, source, actor_id)
  values (c.id, c.status, 'blocked', reason, 'manual', app.current_user_id());
  perform app.log_platform_action('company.suspended', c.id, jsonb_build_object('reason', reason));
end
$$;

create function public.reactivate_company(p_company_id uuid, p_reason text) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  reason text := app.require_reason(p_reason);
  c public.company;
  next_status text;
begin
  perform app.require_platform_admin();
  select * into c from public.company where id = p_company_id and deleted_at is null for update;
  if c.id is null then
    perform app.raise('not_found', 'company_not_found');
  end if;
  if not c.status_locked then
    perform app.raise('conflict', 'company_not_suspended');
  end if;
  c.status_locked := false;
  next_status := app.compute_status(
    c,
    (select ct from public.contract ct where ct.company_id = c.id and ct.valid_to is null and ct.deleted_at is null),
    app.today()
  );
  update public.company set status_locked = false, status_reason = null, status = next_status where id = c.id;
  insert into public.company_status_event (company_id, from_status, to_status, reason, source, actor_id)
  values (c.id, c.status, next_status, reason, 'manual', app.current_user_id());
  perform app.log_platform_action('company.reactivated', c.id, jsonb_build_object('reason', reason, 'status', next_status));
  return next_status;
end
$$;

create function public.cancel_company(p_company_id uuid, p_reason text, p_effective_on date default null) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  reason text := app.require_reason(p_reason);
  effective_on date := coalesce(p_effective_on, app.today());
  c public.company;
begin
  perform app.require_platform_admin();
  select * into c from public.company where id = p_company_id and deleted_at is null for update;
  if c.id is null then
    perform app.raise('not_found', 'company_not_found');
  end if;
  if c.is_investor then
    perform app.raise('forbidden', 'investor_cannot_be_canceled'); -- R00-13
  end if;
  if c.status = 'canceled' then
    perform app.raise('conflict', 'company_already_canceled');
  end if;
  if effective_on < app.today() then
    perform app.raise('validation', 'effective_on_in_the_past');
  end if;

  update public.company set canceled_on = effective_on, status_reason = reason where id = c.id;
  perform app.log_platform_action('company.cancel_scheduled', c.id,
    jsonb_build_object('reason', reason, 'effective_on', effective_on));
  if effective_on <= app.today() then
    update public.company set status = 'canceled' where id = c.id;
    insert into public.company_status_event (company_id, from_status, to_status, reason, source, actor_id)
    values (c.id, c.status, 'canceled', reason, 'manual', app.current_user_id());
    return 'canceled';
  end if;
  return c.status; -- R00-20: keeps operating until the date
end
$$;

-- ---------------------------------------------------------------------------
-- Checks used by every module (R00-03, R00-06) and the company app
-- ---------------------------------------------------------------------------

-- False for anyone who is not a member of the company (nor Super Admin): no probing.
create function public.has_module(p_company_id uuid, p_module_key text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select (app.is_member(p_company_id) or app.is_platform_admin())
    and exists (select 1 from public.company c where c.id = p_company_id and c.deleted_at is null and c.status <> 'canceled')
    and app.module_enabled(p_company_id, p_module_key, app.today())
$$;

create function public.company_can_write(p_company_id uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select (app.is_member(p_company_id) or app.is_platform_admin())
    and exists (
      select 1 from public.company c
      where c.id = p_company_id and c.deleted_at is null and c.status in ('trial', 'active', 'past_due')
    )
$$;

-- What the company app needs to know about its own company (layer 00, section 5).
create function public.my_company_access(p_company_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  c public.company;
  is_owner boolean := app.has_role(p_company_id, array['owner']);
begin
  if not app.is_member(p_company_id) then
    perform app.raise('forbidden', 'not_a_member');
  end if;
  select * into c from public.company where id = p_company_id and deleted_at is null;
  return jsonb_build_object(
    'company_id', c.id,
    'code', c.code,
    'display_name', c.display_name,
    'status', c.status,
    'can_write', c.status in ('trial', 'active', 'past_due'),
    'show_past_due_banner', is_owner and c.status = 'past_due',
    'paid_until', case when is_owner then (
      select ct.paid_until from public.contract ct
      where ct.company_id = c.id and ct.valid_to is null and ct.deleted_at is null) end,
    'modules', (
      select coalesce(jsonb_agg(m.key order by m.sort_order), '[]') from public.module m
      where m.deleted_at is null and app.module_enabled(c.id, m.key, app.today()))
  );
end
$$;

-- ---------------------------------------------------------------------------
-- Grants: only the public API above, only to signed-in users. Internals stay private.
-- ---------------------------------------------------------------------------

revoke all on all routines in schema app from public;
grant execute on function app.current_user_id(), app.current_aal(), app.today(),
  app.is_platform_admin(), app.has_role(uuid, text[]), app.is_member(uuid)
  to authenticated, service_role;

revoke all on function
  public.provision_company(jsonb), public.set_company_modules(uuid, text[], date),
  public.change_contract(uuid, jsonb, date), public.register_saas_payment(uuid, jsonb),
  public.suspend_company(uuid, text), public.reactivate_company(uuid, text),
  public.cancel_company(uuid, text, date), public.recompute_company_status(date),
  public.generate_saas_charges(date), public.has_module(uuid, text), public.company_can_write(uuid),
  public.my_company_access(uuid)
from public, anon;

grant execute on function
  public.provision_company(jsonb), public.set_company_modules(uuid, text[], date),
  public.change_contract(uuid, jsonb, date), public.register_saas_payment(uuid, jsonb),
  public.suspend_company(uuid, text), public.reactivate_company(uuid, text),
  public.cancel_company(uuid, text, date), public.recompute_company_status(date),
  public.generate_saas_charges(date), public.has_module(uuid, text), public.company_can_write(uuid),
  public.my_company_access(uuid)
to authenticated;
