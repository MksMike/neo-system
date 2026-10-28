-- Companies list and creation from the screen (SA-08).

-- ---------------------------------------------------------------------------
-- Provisioning with the id generated on the screen (ADR 0020)
-- ---------------------------------------------------------------------------

-- p = { id?, company: {...}, modules: [...], contract: {...}, owner: { name, email } }
-- Same as before, plus `id`: sending the same request again returns the company created the
-- first time instead of failing or creating a second one (safe retry after a timeout).
create or replace function public.provision_company(p jsonb) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  today date := app.today();
  pc jsonb := p -> 'company';
  owner jsonb := p -> 'owner';
  company_id uuid;
  existing public.company;
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

  if nullif(p ->> 'id', '') is not null then
    if (p ->> 'id') !~ '^[0-9a-fA-F-]{36}$' then
      perform app.raise('validation', 'id_invalid');
    end if;
    select * into existing from public.company c where c.id = (p ->> 'id')::uuid;
    if existing.id is not null then
      if existing.code = v_code then
        return existing.id; -- replay of a request that already succeeded
      end if;
      perform app.raise('conflict', 'company_id_taken');
    end if;
  end if;

  if exists (select 1 from public.company c where c.code = v_code) then
    perform app.raise('conflict', 'company_code_taken');
  end if;
  if nullif(trim(owner ->> 'email'), '') is null or nullif(trim(owner ->> 'name'), '') is null then
    perform app.raise('validation', 'owner_name_email_required');
  end if;

  insert into public.company (
    id, code, legal_name, legal_name_kana, display_name, invoice_reg_no, postal_code, address, phone, email,
    referred_by_company_id, default_locale
  ) values (
    coalesce(nullif(p ->> 'id', '')::uuid, gen_random_uuid()),
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
-- Companies list (layer 00, section 5: /super/empresas)
-- ---------------------------------------------------------------------------

-- p = { q, status, contract_type, sort: code|name|paid_until|status|created, dir: asc|desc, page, page_size }
-- Returns { total, page, page_size, items: [...] }. Deleted companies are left out.
create function public.list_companies(p jsonb default '{}') returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_q text := nullif(trim(p ->> 'q'), '');
  v_status text := nullif(p ->> 'status', '');
  v_type text := nullif(p ->> 'contract_type', '');
  v_sort text := coalesce(nullif(p ->> 'sort', ''), 'code');
  v_desc boolean := coalesce(p ->> 'dir', 'asc') = 'desc';
  v_page integer := greatest(coalesce((p ->> 'page')::integer, 1), 1);
  v_size integer := least(greatest(coalesce((p ->> 'page_size')::integer, 20), 1), 100);
  v_pattern text;
  result jsonb;
begin
  perform app.require_platform_admin();
  if v_sort not in ('code', 'name', 'paid_until', 'status', 'created') then
    perform app.raise('validation', 'sort_invalid');
  end if;
  if v_q is not null then
    v_pattern := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  with rows as (
    select
      c.id, c.code, c.display_name, c.legal_name, c.status, c.is_investor, c.created_at,
      ct.type as contract_type, ct.price_yen, ct.paid_until,
      (select count(*)::int from public.company_module cm
        where cm.company_id = c.id and cm.deleted_at is null
          and cm.valid_from <= app.today() and (cm.valid_to is null or cm.valid_to >= app.today())) as module_count
    from public.company c
    left join public.contract ct
      on ct.company_id = c.id and ct.valid_to is null and ct.deleted_at is null
    where c.deleted_at is null
      and (v_status is null or c.status = v_status)
      and (v_type is null or ct.type = v_type)
      and (v_pattern is null
        or c.code ilike v_pattern or c.display_name ilike v_pattern
        or c.legal_name ilike v_pattern or c.legal_name_kana ilike v_pattern)
  ),
  ordered as (
    select rows.*, row_number() over (
      order by
        case when not v_desc then
          case v_sort when 'code' then code when 'name' then display_name when 'status' then status end
        end asc,
        case when v_desc then
          case v_sort when 'code' then code when 'name' then display_name when 'status' then status end
        end desc,
        case when v_sort = 'paid_until' and not v_desc then paid_until end asc nulls last,
        case when v_sort = 'paid_until' and v_desc then paid_until end desc nulls last,
        case when v_sort = 'created' and not v_desc then created_at end asc,
        case when v_sort = 'created' and v_desc then created_at end desc,
        code
    ) as n
    from rows
  ),
  page as (
    select * from ordered where n > (v_page - 1) * v_size and n <= v_page * v_size
  )
  select jsonb_build_object(
    'total', (select count(*) from rows),
    'page', v_page,
    'page_size', v_size,
    'items', coalesce((select jsonb_agg(to_jsonb(page) - 'created_at' - 'n' order by page.n) from page), '[]')
  ) into result;
  return result;
end
$$;

revoke execute on function public.list_companies(jsonb) from public, anon;
grant execute on function public.list_companies(jsonb) to authenticated;
