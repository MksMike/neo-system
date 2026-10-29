-- Layer 04: organizations (clients, subcontractors, 元請), client chain with color and abbreviation,
-- and work sites. Demonstration scope (ADR 0025): the M1 adds closing, payment terms and billing rules.

-- ---------------------------------------------------------------------------
-- Guards for company business data (R00-03, R00-06, ADR 0023)
-- ---------------------------------------------------------------------------

-- Refuses unless the caller has one of the roles, the module is on and the company accepts writes.
create function app.require_company_write(p_company_id uuid, p_module_key text, p_roles text[]) returns void
language plpgsql stable set search_path = ''
as $$
begin
  if p_company_id is null or not app.has_role(p_company_id, p_roles) then
    perform app.raise('forbidden', 'role_required');
  end if;
  if not public.has_module(p_company_id, p_module_key) then
    perform app.raise('module_disabled', p_module_key);
  end if;
  if not public.company_can_write(p_company_id) then
    perform app.raise('company_read_only', 'company_status');
  end if;
end
$$;

-- Name used to find duplicates (R04-02): NFKC, lower case, without legal forms, spaces and punctuation.
-- (株)杉田工業, 株式会社 杉田工業 and ㈱杉田工業 all become 杉田工業.
create function app.normalize_org_name(p_name text) returns text
language sql immutable set search_path = ''
as $$
  select regexp_replace(
    regexp_replace(
      lower(normalize(coalesce(p_name, ''), nfkc)),
      '株式会社|有限会社|合同会社|合資会社|合名会社|一般社団法人|\(株\)|\(有\)|\(同\)|カブシキガイシャ|カブシキカイシャ|ユウゲンガイシャ|ユウゲンカイシャ|ゴウドウガイシャ|ゴウドウカイシャ|co\.?,? ?ltd\.?|inc\.?|corp\.?|k\.k\.|llc',
      '', 'g'
    ),
    '[[:space:][:punct:]・、。「」（）　]', '', 'g'
  )
$$;

-- Colors of the client chain are design tokens (day-type colors, light and dark), stored by name.
create function app.chain_colors() returns text[]
language sql immutable set search_path = ''
as $$ select array['teiji', 'yukyu', 'zangyo', 'chushi', 'hannichi', 'pending', 'kekkin', 'kyugyo', 'yasumi'] $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.organization (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  name text not null check (char_length(name) between 1 and 200),
  name_kana text check (char_length(name_kana) <= 200),
  normalized_name text not null generated always as (app.normalize_org_name(name)) stored,
  is_client boolean not null default false,
  postal_code text check (postal_code ~ '^[0-9]{7}$'),
  address text check (char_length(address) <= 300),
  phone text check (phone ~ '^0[0-9]{9,10}$'),
  email text check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  invoice_reg_no text check (invoice_reg_no ~ '^T[0-9]{13}$'),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check (normalized_name <> '')
);

-- R04-02: one registry per company; the same organization is never registered twice.
create unique index organization_name_key on public.organization (company_id, normalized_name)
  where deleted_at is null;
create index organization_company_idx on public.organization (company_id, name);

-- Chain above a client: (株)SFK → 内山工業 → client. Position 1 is the closest to the client.
create table public.client_chain (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  client_id uuid not null references public.organization (id),
  organization_id uuid not null references public.organization (id),
  position smallint not null default 1 check (position between 1 and 9),
  color text not null check (color = any (app.chain_colors())),
  abbreviation text not null check (char_length(abbreviation) between 1 and 6),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check (client_id <> organization_id)
);

create unique index client_chain_link_key on public.client_chain (client_id, organization_id)
  where deleted_at is null;
create index client_chain_company_idx on public.client_chain (company_id, client_id);

create table public.site (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  client_id uuid references public.organization (id),
  name text not null check (char_length(name) between 1 and 200),
  postal_code text check (postal_code ~ '^[0-9]{7}$'),
  address text check (char_length(address) <= 300),
  radius_m integer not null default 300 check (radius_m between 50 and 5000),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

create index site_company_idx on public.site (company_id, name);

call app.add_standard_triggers('public.organization', 'company');
call app.add_standard_triggers('public.client_chain', 'company');
call app.add_standard_triggers('public.site', 'company');

-- ---------------------------------------------------------------------------
-- Row level security: office roles of the company read; nobody writes directly (ADR 0023)
-- ---------------------------------------------------------------------------

alter table public.organization enable row level security;
alter table public.client_chain enable row level security;
alter table public.site enable row level security;

grant select on public.organization, public.client_chain, public.site to authenticated;

create policy office_read on public.organization for select to authenticated
  using (app.has_role(company_id, array['owner', 'manager', 'coordinator']) and public.has_module(company_id, 'organizations'));
create policy office_read on public.client_chain for select to authenticated
  using (app.has_role(company_id, array['owner', 'manager', 'coordinator']) and public.has_module(company_id, 'organizations'));
create policy office_read on public.site for select to authenticated
  using (app.has_role(company_id, array['owner', 'manager', 'coordinator']) and public.has_module(company_id, 'organizations'));

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- Validates the common fields of an organization (the screen validates too, ADR 0019).
create function app.check_org_input(p jsonb) returns void
language plpgsql stable set search_path = ''
as $$
begin
  if nullif(trim(p ->> 'name'), '') is null then
    perform app.raise('validation', 'name_required');
  end if;
end
$$;

-- p = { id, company_id, version?, name, name_kana, is_client, postal_code, address, phone, email,
--       invoice_reg_no, note }
-- Creates with the id from the screen (a retry returns the same row) or edits with `version`.
create function public.save_organization(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := (p ->> 'id')::uuid;
  v_company uuid := (p ->> 'company_id')::uuid;
  existing public.organization;
  saved public.organization;
  duplicate uuid;
begin
  perform app.require_company_write(v_company, 'organizations', array['owner', 'manager']);
  perform app.check_org_input(p);

  select * into existing from public.organization o where o.id = v_id for update;
  if existing.id is not null and existing.company_id <> v_company then
    perform app.raise('not_found', 'organization_not_found');
  end if;

  select o.id into duplicate from public.organization o
  where o.company_id = v_company and o.deleted_at is null and o.id <> v_id
    and o.normalized_name = app.normalize_org_name(p ->> 'name');
  if duplicate is not null then
    perform app.raise('conflict', 'organization_duplicate:' || duplicate);
  end if;

  if existing.id is null then
    insert into public.organization (
      id, company_id, name, name_kana, is_client, postal_code, address, phone, email, invoice_reg_no, note
    ) values (
      v_id, v_company, trim(p ->> 'name'), nullif(trim(p ->> 'name_kana'), ''),
      coalesce((p ->> 'is_client')::boolean, false), nullif(p ->> 'postal_code', ''),
      nullif(trim(p ->> 'address'), ''), nullif(p ->> 'phone', ''), nullif(lower(trim(p ->> 'email')), ''),
      nullif(p ->> 'invoice_reg_no', ''), nullif(trim(p ->> 'note'), '')
    ) returning * into saved;
  else
    if existing.deleted_at is not null then
      perform app.raise('not_found', 'organization_not_found');
    end if;
    if (p ->> 'version') is null then
      -- No version: a retry of the creation that already succeeded.
      return to_jsonb(existing);
    end if;
    if existing.version <> (p ->> 'version')::integer then
      perform app.raise('conflict', 'concurrent_update');
    end if;
    update public.organization set
      name = trim(p ->> 'name'),
      name_kana = nullif(trim(p ->> 'name_kana'), ''),
      is_client = coalesce((p ->> 'is_client')::boolean, existing.is_client),
      postal_code = nullif(p ->> 'postal_code', ''),
      address = nullif(trim(p ->> 'address'), ''),
      phone = nullif(p ->> 'phone', ''),
      email = nullif(lower(trim(p ->> 'email')), ''),
      invoice_reg_no = nullif(p ->> 'invoice_reg_no', ''),
      note = nullif(trim(p ->> 'note'), '')
    where id = v_id
    returning * into saved;
  end if;
  return to_jsonb(saved);
end
$$;

-- Organizations whose name matches (R04-02), before a quick registration: avoids duplicates.
create function public.find_organizations(p_company_id uuid, p_name text, p_limit integer default 8)
returns table (id uuid, name text, is_client boolean)
language sql stable security definer set search_path = ''
as $$
  select o.id, o.name, o.is_client
  from public.organization o
  where app.has_role(p_company_id, array['owner', 'manager', 'coordinator'])
    and public.has_module(p_company_id, 'organizations')
    and o.company_id = p_company_id and o.deleted_at is null
    and app.normalize_org_name(p_name) <> ''
    and o.normalized_name like '%' || replace(replace(replace(app.normalize_org_name(p_name), '\', '\\'), '%', '\%'), '_', '\_') || '%'
  order by (o.normalized_name = app.normalize_org_name(p_name)) desc, o.name
  limit least(greatest(coalesce(p_limit, 8), 1), 20)
$$;

-- p = { id, company_id, client_id, organization_id | organization: { id, name, name_kana },
--       position, color?, abbreviation? }
-- Links a subcontractor above a client. A new organization is created on the spot (quick "+"),
-- unless one with the same name exists (R04-02). Color: the next free one of the client (R04-03).
create function public.link_subcontractor(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := (p ->> 'id')::uuid;
  v_company uuid := (p ->> 'company_id')::uuid;
  v_client uuid := (p ->> 'client_id')::uuid;
  v_org uuid := nullif(p ->> 'organization_id', '')::uuid;
  new_org jsonb := p -> 'organization';
  v_color text := nullif(p ->> 'color', '');
  v_abbr text := nullif(trim(p ->> 'abbreviation'), '');
  existing public.client_chain;
  saved public.client_chain;
begin
  perform app.require_company_write(v_company, 'organizations', array['owner', 'manager']);

  select * into existing from public.client_chain c where c.id = v_id;
  if existing.id is not null then
    if existing.company_id <> v_company then
      perform app.raise('not_found', 'chain_not_found');
    end if;
    return to_jsonb(existing); -- retry of a link that already succeeded
  end if;

  if not exists (select 1 from public.organization o
                 where o.id = v_client and o.company_id = v_company and o.deleted_at is null and o.is_client) then
    perform app.raise('not_found', 'client_not_found');
  end if;

  if v_org is null then
    if new_org is null or nullif(trim(new_org ->> 'name'), '') is null then
      perform app.raise('validation', 'organization_required');
    end if;
    select o.id into v_org from public.organization o
    where o.company_id = v_company and o.deleted_at is null
      and o.normalized_name = app.normalize_org_name(new_org ->> 'name');
    if v_org is null then
      v_org := coalesce(nullif(new_org ->> 'id', '')::uuid, gen_random_uuid());
      insert into public.organization (id, company_id, name, name_kana)
      values (v_org, v_company, trim(new_org ->> 'name'), nullif(trim(new_org ->> 'name_kana'), ''));
    end if;
  elsif not exists (select 1 from public.organization o
                    where o.id = v_org and o.company_id = v_company and o.deleted_at is null) then
    perform app.raise('not_found', 'organization_not_found');
  end if;

  if v_org = v_client then
    perform app.raise('validation', 'chain_self');
  end if;
  if exists (select 1 from public.client_chain c
             where c.client_id = v_client and c.organization_id = v_org and c.deleted_at is null) then
    perform app.raise('conflict', 'chain_duplicate');
  end if;

  if v_color is null then
    select k into v_color from unnest(app.chain_colors()) with ordinality as t(k, n)
    where k <> all (select c.color from public.client_chain c where c.client_id = v_client and c.deleted_at is null)
    order by n limit 1;
    v_color := coalesce(v_color, (app.chain_colors())[1]);
  end if;
  if v_abbr is null then
    select left(app.normalize_org_name(o.name), 2) into v_abbr from public.organization o where o.id = v_org;
    v_abbr := upper(coalesce(nullif(v_abbr, ''), '?'));
  end if;

  insert into public.client_chain (id, company_id, client_id, organization_id, position, color, abbreviation)
  values (v_id, v_company, v_client, v_org, coalesce((p ->> 'position')::smallint, 1), v_color, v_abbr)
  returning * into saved;
  return to_jsonb(saved);
end
$$;

-- p = { id, company_id, version, position, color, abbreviation, removed? }
-- Edits a link (color, abbreviation, position) or removes it (logical deletion, CLAUDE.md rule 5).
create function public.update_chain(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_company uuid := (p ->> 'company_id')::uuid;
  existing public.client_chain;
  saved public.client_chain;
begin
  perform app.require_company_write(v_company, 'organizations', array['owner', 'manager']);
  select * into existing from public.client_chain c
  where c.id = (p ->> 'id')::uuid and c.company_id = v_company and c.deleted_at is null
  for update;
  if existing.id is null then
    perform app.raise('not_found', 'chain_not_found');
  end if;
  if existing.version <> (p ->> 'version')::integer then
    perform app.raise('conflict', 'concurrent_update');
  end if;

  update public.client_chain set
    deleted_at = case when coalesce((p ->> 'removed')::boolean, false) then now() else null end,
    position = coalesce((p ->> 'position')::smallint, existing.position),
    color = coalesce(nullif(p ->> 'color', ''), existing.color),
    abbreviation = coalesce(nullif(trim(p ->> 'abbreviation'), ''), existing.abbreviation)
  where id = existing.id
  returning * into saved;
  return to_jsonb(saved);
end
$$;

-- p = { id, company_id, version?, client_id, name, postal_code, address, radius_m, note }
create function public.save_site(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := (p ->> 'id')::uuid;
  v_company uuid := (p ->> 'company_id')::uuid;
  v_client uuid := nullif(p ->> 'client_id', '')::uuid;
  existing public.site;
  saved public.site;
begin
  perform app.require_company_write(v_company, 'organizations', array['owner', 'manager']);
  if nullif(trim(p ->> 'name'), '') is null then
    perform app.raise('validation', 'name_required');
  end if;
  if v_client is not null and not exists (
    select 1 from public.organization o
    where o.id = v_client and o.company_id = v_company and o.deleted_at is null and o.is_client
  ) then
    perform app.raise('not_found', 'client_not_found');
  end if;

  select * into existing from public.site s where s.id = v_id for update;
  if existing.id is not null and (existing.company_id <> v_company or existing.deleted_at is not null) then
    perform app.raise('not_found', 'site_not_found');
  end if;

  if existing.id is null then
    insert into public.site (id, company_id, client_id, name, postal_code, address, radius_m, note)
    values (
      v_id, v_company, v_client, trim(p ->> 'name'), nullif(p ->> 'postal_code', ''),
      nullif(trim(p ->> 'address'), ''), coalesce((p ->> 'radius_m')::integer, 300), nullif(trim(p ->> 'note'), '')
    ) returning * into saved;
  else
    if (p ->> 'version') is null then
      return to_jsonb(existing);
    end if;
    if existing.version <> (p ->> 'version')::integer then
      perform app.raise('conflict', 'concurrent_update');
    end if;
    update public.site set
      client_id = v_client,
      name = trim(p ->> 'name'),
      postal_code = nullif(p ->> 'postal_code', ''),
      address = nullif(trim(p ->> 'address'), ''),
      radius_m = coalesce((p ->> 'radius_m')::integer, existing.radius_m),
      note = nullif(trim(p ->> 'note'), '')
    where id = v_id
    returning * into saved;
  end if;
  return to_jsonb(saved);
end
$$;

revoke execute on function
  public.save_organization(jsonb), public.find_organizations(uuid, text, integer),
  public.link_subcontractor(jsonb), public.update_chain(jsonb), public.save_site(jsonb)
from public, anon;
grant execute on function
  public.save_organization(jsonb), public.find_organizations(uuid, text, integer),
  public.link_subcontractor(jsonb), public.update_chain(jsonb), public.save_site(jsonb)
to authenticated;
