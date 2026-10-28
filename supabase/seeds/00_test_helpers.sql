-- Test helpers for pgTAP (supabase/tests). Seeds run only locally and in CI, never in production.
-- Inspired by the common "authenticate as" pattern: switch to the authenticated role with JWT claims.

create schema if not exists tests;
grant usage on schema tests to authenticated, anon, service_role;

-- Creates a confirmed user in auth.users and returns its id.
create or replace function tests.create_user(p_email text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  user_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', p_email,
    '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );
  return user_id;
end
$$;

-- Creates a user and registers it as Super Admin.
create or replace function tests.create_platform_admin(p_email text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  user_id uuid := tests.create_user(p_email);
begin
  insert into public.platform_admin (user_id, name, created_by) values (user_id, 'Test Admin', user_id);
  return user_id;
end
$$;

-- Adds a membership directly (memberships are managed by layer 01 functions later).
create or replace function tests.add_member(p_user_id uuid, p_company_id uuid, p_role text) returns void
language sql security definer set search_path = ''
as $$
  insert into public.membership (user_id, company_id, role, created_by) values (p_user_id, p_company_id, p_role, p_user_id);
$$;

-- E-mail of a user, readable whatever role the test is acting as (authenticated cannot read auth.users).
create or replace function tests.user_email(p_user_id uuid) returns text
language sql stable security definer set search_path = ''
as $$ select u.email from auth.users u where u.id = p_user_id $$;

-- Acts as a signed-in user. aal2 = signed in with the second factor (TOTP).
create or replace function tests.authenticate_as(p_user_id uuid, p_aal text default 'aal2') returns void
language plpgsql set search_path = ''
as $$
declare
  user_email text := tests.user_email(p_user_id);
begin
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', p_user_id, 'role', 'authenticated', 'aal', p_aal,
      'email', user_email
    )::text,
    true
  );
end
$$;

create or replace function tests.authenticate_as_anon() returns void
language plpgsql set search_path = ''
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
end
$$;

-- Back to the test runner (postgres), e.g. to arrange data or simulate a migration.
create or replace function tests.clear_authentication() returns void
language plpgsql set search_path = ''
as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', null, true);
end
$$;

-- Minimal provisioning payload. Override fields with jsonb concatenation in each test.
create or replace function tests.company_payload(p_code text, p_contract jsonb default null, p_modules text[] default '{}')
returns jsonb
language sql immutable set search_path = ''
as $$
  select jsonb_build_object(
    'company', jsonb_build_object('code', p_code, 'legal_name', p_code || ' 株式会社'),
    'contract', coalesce(p_contract, jsonb_build_object('type', 'monthly', 'price_yen', 55000, 'payment_method', 'transfer')),
    'modules', to_jsonb(p_modules),
    'owner', jsonb_build_object('name', 'Owner ' || p_code, 'email', lower(p_code) || '@example.com')
  )
$$;

-- Last, so it covers every helper above (new routines are not executable by PUBLIC, ADR 0023).
grant execute on all routines in schema tests to authenticated, anon, service_role;
