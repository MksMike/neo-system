-- Security structure, roles and isolation between companies (ADR 0002, ADR 0016, ADR 0023).
begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

set local app.today_override = '2026-11-03';

-- ---------------------------------------------------------------------------
-- Structure: RLS everywhere, no direct writes, private internals (ADR 0023)
-- ---------------------------------------------------------------------------

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0, 'every table in public has row level security enabled'
);

select is(
  (select count(*)::int from information_schema.role_table_grants
   where table_schema = 'public' and grantee in ('anon', 'authenticated')
     and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
  0, 'anon and authenticated cannot insert, update or delete any table directly'
);

select is(
  (select count(*)::int from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'anon'),
  0, 'anon has no privilege on any table'
);

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'app') and p.prosecdef
     and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) cfg where cfg like 'search_path=%')),
  0, 'every security definer function pins its search_path'
);

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'app') and has_function_privilege('anon', p.oid, 'execute')),
  0, 'anon cannot execute any function in public or app'
);

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'app' and has_function_privilege('authenticated', p.oid, 'execute')
     and p.proname not in ('current_user_id', 'current_aal', 'today', 'is_platform_admin', 'has_role', 'is_member')),
  0, 'authenticated can only execute the policy helpers in app'
);

-- ---------------------------------------------------------------------------
-- Arrange: one Super Admin, two companies, one owner and one employee in company A
-- ---------------------------------------------------------------------------

select set_config('t.admin', tests.create_platform_admin('admin@neo.test')::text, true);
select set_config('t.owner_a', tests.create_user('owner-a@neo.test')::text, true);
select set_config('t.worker_a', tests.create_user('worker-a@neo.test')::text, true);
select set_config('t.stranger', tests.create_user('stranger@neo.test')::text, true);

select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.a', public.provision_company(tests.company_payload('TALPHA', null, '{employees}'))::text, true);
select set_config('t.b', public.provision_company(tests.company_payload('TBRAVO', null, '{employees,organizations}'))::text, true);

select tests.clear_authentication();
select tests.add_member(current_setting('t.owner_a')::uuid, current_setting('t.a')::uuid, 'owner');
select tests.add_member(current_setting('t.worker_a')::uuid, current_setting('t.a')::uuid, 'employee');

-- ---------------------------------------------------------------------------
-- Anonymous
-- ---------------------------------------------------------------------------

select tests.authenticate_as_anon();
select throws_ok($$ select count(*) from public.company $$, '42501', null, 'anon cannot read companies');
select throws_ok($$ select public.has_module(current_setting('t.a')::uuid, 'employees') $$, '42501', null,
  'anon cannot call has_module');

-- ---------------------------------------------------------------------------
-- A signed-in user who is not Super Admin
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.stranger')::uuid);
select is((select count(*)::int from public.company), 0, 'a regular user sees no company rows');
select is((select count(*)::int from public.contract), 0, 'a regular user sees no contracts');
select throws_ok(
  $$ insert into public.company (code, legal_name, display_name) values ('HACK', 'x', 'x') $$,
  '42501', null, 'a regular user cannot insert into company directly'
);
select throws_ok(
  $$ update public.company set status = 'active' $$,
  '42501', null, 'a regular user cannot update company directly'
);
select throws_ok(
  $$ select public.provision_company(tests.company_payload('THACK')) $$,
  'P0001', 'forbidden', 'a regular user cannot provision a company'
);
select is(public.has_module(current_setting('t.a')::uuid, 'employees'), false,
  'a non-member gets false from has_module (no probing)');

-- ---------------------------------------------------------------------------
-- Super Admin without the second factor
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.admin')::uuid, 'aal1');
select is((select count(*)::int from public.company), 0, 'Super Admin without 2FA sees no company rows');
select throws_ok(
  $$ select public.suspend_company(current_setting('t.a')::uuid, 'test') $$,
  'P0001', 'forbidden', 'Super Admin without 2FA cannot act'
);

-- ---------------------------------------------------------------------------
-- Super Admin with 2FA sees the platform, but not business data (R00-10)
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.admin')::uuid);
select is(
  (select count(*)::int from public.company where id in (current_setting('t.a')::uuid, current_setting('t.b')::uuid)),
  2, 'Super Admin with 2FA sees both companies'
);
select is(
  (select count(*)::int from public.membership where company_id = current_setting('t.a')::uuid),
  2, 'Super Admin sees the memberships of a company (Users tab)'
);

-- ---------------------------------------------------------------------------
-- Isolation between companies
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_a')::uuid);
select is(
  (public.my_company_access(current_setting('t.a')::uuid) ->> 'code'),
  'TALPHA', 'the owner of A reads the access summary of A'
);
select throws_ok(
  $$ select public.my_company_access(current_setting('t.b')::uuid) $$,
  'P0001', 'forbidden', 'the owner of A cannot read the access summary of B'
);
select is(public.has_module(current_setting('t.b')::uuid, 'organizations'), false,
  'the owner of A gets false from has_module for B');
select is(
  (select count(*)::int from public.membership where company_id = current_setting('t.b')::uuid),
  0, 'the owner of A sees no membership of B'
);

select tests.authenticate_as(current_setting('t.owner_a')::uuid, 'aal1');
select throws_ok(
  $$ select public.my_company_access(current_setting('t.a')::uuid) $$,
  'P0001', 'forbidden', 'the owner without 2FA is not treated as owner (ADR 0016)'
);

select tests.authenticate_as(current_setting('t.worker_a')::uuid, 'aal1');
select is(
  (select count(*)::int from public.membership),
  1, 'an employee sees only their own membership'
);

select * from finish();
rollback;
