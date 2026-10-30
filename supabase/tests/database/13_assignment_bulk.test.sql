-- Layer 06, panel 2: bulk editing of the days of an assignment (R06-11).
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin-l06b@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.a', public.provision_company(tests.company_payload('TBLKA', null, '{scheduling}'))::text, true);
select set_config('t.b', public.provision_company(tests.company_payload('TBLKB', null, '{scheduling}'))::text, true);
select tests.clear_authentication();

select set_config('t.owner', tests.create_user('owner-l06b@neo.test')::text, true);
select set_config('t.coord', tests.create_user('coord-l06b@neo.test')::text, true);
select set_config('t.owner_b', tests.create_user('owner-b-l06b@neo.test')::text, true);
select tests.add_member(current_setting('t.owner')::uuid, current_setting('t.a')::uuid, 'owner');
select tests.add_member(current_setting('t.coord')::uuid, current_setting('t.a')::uuid, 'coordinator');
select tests.add_member(current_setting('t.owner_b')::uuid, current_setting('t.b')::uuid, 'owner');

-- Arrange: client with a subcontractor and a site, two employees
select tests.authenticate_as(current_setting('t.owner')::uuid);
select set_config('t.client', gen_random_uuid()::text, true);
select public.save_organization(jsonb_build_object('id', current_setting('t.client'), 'company_id', current_setting('t.a'),
  'name', '大成建設', 'is_client', true));
select set_config('t.chain', public.link_subcontractor(jsonb_build_object('id', gen_random_uuid(),
  'company_id', current_setting('t.a'), 'client_id', current_setting('t.client'),
  'organization', jsonb_build_object('name', '内山工業'))) ->> 'id', true);
select set_config('t.site', gen_random_uuid()::text, true);
select public.save_site(jsonb_build_object('id', current_setting('t.site'), 'company_id', current_setting('t.a'),
  'client_id', current_setting('t.client'), 'name', '品川工場'));
select set_config('t.e1', gen_random_uuid()::text, true);
select set_config('t.e2', gen_random_uuid()::text, true);
select public.save_employee(jsonb_build_object('id', current_setting('t.e1'), 'company_id', current_setting('t.a'),
  'full_name', 'Silva', 'employment_type', 'regular'));
select public.save_employee(jsonb_build_object('id', current_setting('t.e2'), 'company_id', current_setting('t.a'),
  'full_name', 'Tanaka', 'employment_type', 'regular'));

-- An assignment of one week with both employees on every day
select tests.authenticate_as(current_setting('t.coord')::uuid);
select set_config('t.asg', gen_random_uuid()::text, true);
select public.save_assignment(jsonb_build_object('id', current_setting('t.asg'), 'company_id', current_setting('t.a'),
  'client_id', current_setting('t.client'), 'starts_on', '2026-11-02', 'ends_on', '2026-11-08',
  'start_time', '08:00', 'end_time', '17:00', 'day_rate', 20000));
select public.add_assignment_employee(jsonb_build_object('company_id', current_setting('t.a'),
  'assignment_id', current_setting('t.asg'), 'employee_id', current_setting('t.e1')));
select public.add_assignment_employee(jsonb_build_object('company_id', current_setting('t.a'),
  'assignment_id', current_setting('t.asg'), 'employee_id', current_setting('t.e2')));

-- Selection: e1 from the 3rd to the 5th
select set_config('t.sel', (select jsonb_agg(jsonb_build_object('id', id, 'version', version))::text
  from public.assignment_day where assignment_id = current_setting('t.asg')::uuid
    and employee_id = current_setting('t.e1')::uuid and day between '2026-11-03' and '2026-11-05'), true);

select is(
  public.bulk_update_assignment_days(jsonb_build_object('company_id', current_setting('t.a'),
    'assignment_id', current_setting('t.asg'), 'days', current_setting('t.sel')::jsonb,
    'set', jsonb_build_object('day_rate', 25000, 'chain_id', current_setting('t.chain'), 'status', 'work'))),
  3, 'R06-11 the selected days change together');
select is(
  (select string_agg(day_rate::text, ',' order by day) from public.assignment_day
   where assignment_id = current_setting('t.asg')::uuid and employee_id = current_setting('t.e1')::uuid
     and day between '2026-11-02' and '2026-11-06'),
  '20000,25000,25000,25000,20000', 'R06-11 only the selected days change');
select is(
  (select count(*)::int from public.assignment_day where assignment_id = current_setting('t.asg')::uuid
     and employee_id = current_setting('t.e2')::uuid and day_rate = 25000),
  0, 'R06-11 the other employee is not touched');
select is(
  (select string_agg(distinct status || ':' || (chain_id = current_setting('t.chain')::uuid)::text, ',')
   from public.assignment_day where id in (select (x ->> 'id')::uuid from jsonb_array_elements(current_setting('t.sel')::jsonb) x)),
  'work:true', 'keys present in set are applied (status, subcontractor)');
select throws_ok(
  format($$ select public.bulk_update_assignment_days('{"company_id":"%s","assignment_id":"%s","days":%s,"set":{"day_rate":1}}') $$,
    current_setting('t.a'), current_setting('t.asg'), current_setting('t.sel')),
  'P0001', 'conflict', 'a selection with an old version changes nothing (ADR 0020)');
select is((select count(*)::int from public.assignment_day where day_rate = 1), 0,
  'nothing was applied after the conflict');

-- Removing the selection
select set_config('t.sel', (select jsonb_agg(jsonb_build_object('id', id, 'version', version))::text
  from public.assignment_day where assignment_id = current_setting('t.asg')::uuid
    and employee_id = current_setting('t.e2')::uuid and day >= '2026-11-07'), true);
select is(
  public.remove_assignment_days(jsonb_build_object('company_id', current_setting('t.a'),
    'assignment_id', current_setting('t.asg'), 'days', current_setting('t.sel')::jsonb)),
  2, 'R06-11 the selected days are removed (logical)');

-- Isolation
select tests.authenticate_as(current_setting('t.owner_b')::uuid);
select throws_ok(
  format($$ select public.bulk_update_assignment_days('{"company_id":"%s","assignment_id":"%s","days":[{"id":"%s","version":1}],"set":{"day_rate":1}}') $$,
    current_setting('t.b'), current_setting('t.asg'), gen_random_uuid()),
  'P0001', 'not_found', 'company B cannot bulk edit a company A assignment');
select throws_ok(
  format($$ select public.remove_assignment_days('{"company_id":"%s","assignment_id":"%s","days":[{"id":"%s","version":1}]}') $$,
    current_setting('t.a'), current_setting('t.asg'), gen_random_uuid()),
  'P0001', 'forbidden', 'company B cannot remove company A days');

select * from finish();
rollback;
