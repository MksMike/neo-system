-- Layer 05: employees and the app access by ID + PIN (D-03, ADR 0016).
begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

create function pg_temp.as_service_role() returns void language plpgsql as $$
begin
  perform set_config('role', 'service_role', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
end $$;

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin-l05@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.a', public.provision_company(tests.company_payload('TEMPA', null, '{employees}'))::text, true);
select set_config('t.b', public.provision_company(tests.company_payload('TEMPB', null, '{employees}'))::text, true);
select tests.clear_authentication();

select set_config('t.owner_a', tests.create_user('owner-a-l05@neo.test')::text, true);
select set_config('t.owner_b', tests.create_user('owner-b-l05@neo.test')::text, true);
select set_config('t.coord_a', tests.create_user('coord-a-l05@neo.test')::text, true);
select tests.add_member(current_setting('t.owner_a')::uuid, current_setting('t.a')::uuid, 'owner');
select tests.add_member(current_setting('t.owner_b')::uuid, current_setting('t.b')::uuid, 'owner');
select tests.add_member(current_setting('t.coord_a')::uuid, current_setting('t.a')::uuid, 'coordinator');

select set_config('t.emp', gen_random_uuid()::text, true);
select set_config('t.payload', jsonb_build_object(
  'id', current_setting('t.emp'), 'company_id', current_setting('t.a'),
  'full_name', 'Silva Mike', 'employment_type', 'regular', 'nationality', 'BR', 'mobile_phone', '09012345678'
)::text, true);

-- ---------------------------------------------------------------------------
-- Registration
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_a')::uuid);
select is(public.save_employee(current_setting('t.payload')::jsonb) ->> 'status', 'active',
  'the owner registers an employee, active by default');
select is(public.save_employee(current_setting('t.payload')::jsonb) ->> 'id', current_setting('t.emp'),
  'sending the same creation again returns the same employee (ADR 0020)');
select is((select count(*)::int from public.employee where company_id = current_setting('t.a')::uuid), 1,
  'the retry did not create a second employee');
select is(
  public.save_employee(current_setting('t.payload')::jsonb || '{"version":1,"employment_type":"part_time"}') ->> 'version',
  '2', 'editing with the current version goes through');
select throws_ok(
  $$ select public.save_employee(current_setting('t.payload')::jsonb || '{"version":1}') $$,
  'P0001', 'conflict', 'editing with an old version is refused');
select throws_ok(
  format($$ select public.save_employee('{"id":"%s","company_id":"%s","full_name":"X","employment_type":"boss"}') $$,
    gen_random_uuid(), current_setting('t.a')),
  '23514', null, 'only the four employment types are accepted');

-- ---------------------------------------------------------------------------
-- Access, step 1 (office user)
-- ---------------------------------------------------------------------------

select is(
  public.begin_employee_access(current_setting('t.a')::uuid, current_setting('t.emp')::uuid) ->> 'user_id',
  null, 'an employee without access has no login yet');

select tests.authenticate_as(current_setting('t.coord_a')::uuid);
select is((select count(*)::int from public.employee), 1, 'the coordinator reads the employees');
select throws_ok(
  format($$ select public.begin_employee_access('%s', '%s') $$, current_setting('t.a'), current_setting('t.emp')),
  'P0001', 'forbidden', 'the coordinator does not create app access');

select tests.authenticate_as(current_setting('t.owner_b')::uuid);
select is((select count(*)::int from public.employee), 0, 'company B sees none of company A employees');
select throws_ok(
  format($$ select public.begin_employee_access('%s', '%s') $$, current_setting('t.b'), current_setting('t.emp')),
  'P0001', 'not_found', 'company B cannot create access for a company A employee');

-- ---------------------------------------------------------------------------
-- Access, step 2 (server only)
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_a')::uuid);
select throws_ok(
  format($$ select public.finish_employee_access('%s', '%s', '%s', '48217305') $$,
    current_setting('t.a'), current_setting('t.emp'), current_setting('t.owner_a')),
  '42501', null, 'a signed-in user cannot link a login to an employee');

select tests.clear_authentication();
select set_config('t.login', tests.create_user('48217305@pin.neo-system.invalid')::text, true);
select pg_temp.as_service_role();
select throws_ok(
  format($$ select public.finish_employee_access('%s', '%s', '%s', '48217305') $$,
    current_setting('t.b'), current_setting('t.emp'), current_setting('t.login')),
  'P0001', 'not_found', 'the server call filters the company: another company id is refused');
select lives_ok(
  format($$ select public.finish_employee_access('%s', '%s', '%s', '48217305') $$,
    current_setting('t.a'), current_setting('t.emp'), current_setting('t.login')),
  'the server links the technical login to the employee');
select tests.clear_authentication();

select is((select user_id::text from public.employee where id = current_setting('t.emp')::uuid),
  current_setting('t.login'), 'the employee now has the login');
select is(
  (select login_kind || ':' || employee_login_id from public.user_profile where user_id = current_setting('t.login')::uuid),
  'pin:48217305', 'the profile is a PIN login with the 8-digit ID');
select is(
  (select role from public.membership where user_id = current_setting('t.login')::uuid and company_id = current_setting('t.a')::uuid),
  'employee', 'the login takes part in the company as an employee');

-- Reset: every session of that login ends (ADR 0016, item 8)
insert into auth.sessions (id, user_id, created_at, updated_at)
values (gen_random_uuid(), current_setting('t.login')::uuid, now(), now());
select pg_temp.as_service_role();
select public.finish_employee_access(current_setting('t.a')::uuid, current_setting('t.emp')::uuid,
  current_setting('t.login')::uuid, '48217305', true);
select tests.clear_authentication();
select is((select count(*)::int from auth.sessions where user_id = current_setting('t.login')::uuid), 0,
  'resetting the PIN ends the sessions of that login');
select is(
  (select count(*)::int from public.membership where user_id = current_setting('t.login')::uuid),
  1, 'the reset does not create a second membership');

select tests.authenticate_as(current_setting('t.login')::uuid);
select is((select full_name from public.employee), 'Silva Mike', 'the employee reads only their own record');

select tests.authenticate_as(current_setting('t.coord_a')::uuid);
select is(
  (select login_id from public.employee_login_ids(array[current_setting('t.login')::uuid])),
  '48217305', 'the office of the company sees the employee ID'
);
select tests.authenticate_as(current_setting('t.owner_b')::uuid);
select is(
  (select count(*)::int from public.employee_login_ids(array[current_setting('t.login')::uuid])),
  0, 'another company does not see the ID'
);

select * from finish();
rollback;
