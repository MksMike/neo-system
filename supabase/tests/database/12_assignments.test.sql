-- Layer 06: assignments, allocations and the calendar (D-04).
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin-l06@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.a', public.provision_company(tests.company_payload('TASGA', null, '{scheduling}'))::text, true);
select set_config('t.b', public.provision_company(tests.company_payload('TASGB', null, '{scheduling}'))::text, true);
select tests.clear_authentication();

select set_config('t.owner', tests.create_user('owner-l06@neo.test')::text, true);
select set_config('t.coord', tests.create_user('coord-l06@neo.test')::text, true);
select set_config('t.owner_b', tests.create_user('owner-b-l06@neo.test')::text, true);
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

-- ---------------------------------------------------------------------------
-- Assignment (the coordinator creates assignments: docs/00-ancora.md "Papéis")
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.coord')::uuid);
select set_config('t.asg', gen_random_uuid()::text, true);
select set_config('t.payload', jsonb_build_object(
  'id', current_setting('t.asg'), 'company_id', current_setting('t.a'), 'client_id', current_setting('t.client'),
  'chain_id', current_setting('t.chain'), 'site_id', current_setting('t.site'),
  'starts_on', '2026-11-02', 'ends_on', '2026-11-15', 'start_time', '08:00', 'end_time', '17:00',
  'work_days', jsonb_build_array(1, 2, 3, 4, 5, 6)
)::text, true);
select is(public.save_assignment(current_setting('t.payload')::jsonb) ->> 'version', '1',
  'the coordinator creates an assignment');
select is(public.save_assignment(current_setting('t.payload')::jsonb) ->> 'id', current_setting('t.asg'),
  'sending the same creation again returns the same assignment');
select throws_ok(
  $$ select public.save_assignment(current_setting('t.payload')::jsonb || '{"version":1,"ends_on":"2026-11-01"}') $$,
  'P0001', 'validation', 'the period cannot end before it starts');

-- ---------------------------------------------------------------------------
-- Allocation
-- ---------------------------------------------------------------------------

select is(
  public.add_assignment_member(jsonb_build_object('id', gen_random_uuid(), 'company_id', current_setting('t.a'),
    'assignment_id', current_setting('t.asg'), 'employee_id', current_setting('t.e1'))) ->> 'ends_on',
  '2026-11-15', 'without an interval the employee is allocated for the whole period');
select set_config('t.m2', gen_random_uuid()::text, true);
select is(
  public.add_assignment_member(jsonb_build_object('id', current_setting('t.m2'), 'company_id', current_setting('t.a'),
    'assignment_id', current_setting('t.asg'), 'employee_id', current_setting('t.e2'),
    'starts_on', '2026-11-09', 'ends_on', '2026-11-13')) ->> 'starts_on',
  '2026-11-09', 'an employee can be allocated for an interval');
select throws_ok(
  format($$ select public.add_assignment_member('{"id":"%s","company_id":"%s","assignment_id":"%s","employee_id":"%s"}') $$,
    gen_random_uuid(), current_setting('t.a'), current_setting('t.asg'), current_setting('t.e1')),
  'P0001', 'conflict', 'the same employee is not allocated twice to an assignment');
select throws_ok(
  format($$ select public.add_assignment_member('{"id":"%s","company_id":"%s","assignment_id":"%s","employee_id":"%s","starts_on":"2026-11-01"}') $$,
    gen_random_uuid(), current_setting('t.a'), current_setting('t.asg'), current_setting('t.e1')),
  'P0001', 'validation', 'an interval outside the period is refused');

-- R06-02: overlapping hours are refused; a stretch after the first one is accepted
select set_config('t.night', gen_random_uuid()::text, true);
select public.save_assignment(jsonb_build_object('id', current_setting('t.night'), 'company_id', current_setting('t.a'),
  'client_id', current_setting('t.client'), 'starts_on', '2026-11-10', 'ends_on', '2026-11-10',
  'start_time', '16:00', 'end_time', '22:00', 'work_days', jsonb_build_array(2)));
select throws_ok(
  format($$ select public.add_assignment_member('{"id":"%s","company_id":"%s","assignment_id":"%s","employee_id":"%s"}') $$,
    gen_random_uuid(), current_setting('t.a'), current_setting('t.night'), current_setting('t.e1')),
  'P0001', 'conflict', 'R06-02 overlapping hours on the same day are refused');
select set_config('t.evening', gen_random_uuid()::text, true);
select public.save_assignment(jsonb_build_object('id', current_setting('t.evening'), 'company_id', current_setting('t.a'),
  'client_id', current_setting('t.client'), 'starts_on', '2026-11-10', 'ends_on', '2026-11-10',
  'start_time', '18:00', 'end_time', '22:00', 'work_days', jsonb_build_array(2)));
select lives_ok(
  format($$ select public.add_assignment_member('{"id":"%s","company_id":"%s","assignment_id":"%s","employee_id":"%s"}') $$,
    gen_random_uuid(), current_setting('t.a'), current_setting('t.evening'), current_setting('t.e1')),
  'R06-02 a second stretch after the first one is accepted');
select is(
  (select count(*)::int from public.calendar_days(current_setting('t.a')::uuid, '2026-11-10', '2026-11-10')
   where employee_id = current_setting('t.e1')::uuid),
  2, 'the calendar shows both stretches of the day');

-- ---------------------------------------------------------------------------
-- Calendar
-- ---------------------------------------------------------------------------

select is(
  (select count(*)::int from public.calendar_days(current_setting('t.a')::uuid, '2026-11-02', '2026-11-08', current_setting('t.asg')::uuid)
   where employee_id = current_setting('t.e1')::uuid),
  7, 'the calendar has one row per day of the allocation');
select is(
  (select off from public.calendar_days(current_setting('t.a')::uuid, '2026-11-08', '2026-11-08', current_setting('t.asg')::uuid)
   where employee_id = current_setting('t.e1')::uuid),
  true, 'a day outside the work days is an off day (休)');
select is(
  (select color || ':' || site_name from public.calendar_days(current_setting('t.a')::uuid, '2026-11-02', '2026-11-02')
   where employee_id = current_setting('t.e1')::uuid),
  'teiji:品川工場', 'the calendar carries the subcontractor color and the site');
select throws_ok(
  format($$ select * from public.calendar_days('%s', '2026-01-01', '2026-12-31') $$, current_setting('t.a')),
  'P0001', 'validation', 'the calendar range is limited');

-- Removing an allocation and editing outside the allocations
select public.remove_assignment_member(current_setting('t.a')::uuid, current_setting('t.m2')::uuid, 1);
select is(
  (select count(*)::int from public.calendar_days(current_setting('t.a')::uuid, '2026-11-09', '2026-11-13', current_setting('t.asg')::uuid)
   where employee_id = current_setting('t.e2')::uuid),
  0, 'a removed allocation leaves the calendar');
select throws_ok(
  $$ select public.save_assignment(current_setting('t.payload')::jsonb || '{"version":1,"ends_on":"2026-11-10"}') $$,
  'P0001', 'validation', 'the period cannot shrink below an allocation');

-- ---------------------------------------------------------------------------
-- Isolation
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_b')::uuid);
select is((select count(*)::int from public.assignment), 0, 'company B sees none of company A assignments');
select throws_ok(
  format($$ select * from public.calendar_days('%s', '2026-11-02', '2026-11-08') $$, current_setting('t.a')),
  'P0001', 'forbidden', 'company B cannot read company A calendar');
select throws_ok(
  format($$ select public.add_assignment_member('{"id":"%s","company_id":"%s","assignment_id":"%s","employee_id":"%s"}') $$,
    gen_random_uuid(), current_setting('t.b'), current_setting('t.asg'), current_setting('t.e2')),
  'P0001', 'not_found', 'company B cannot allocate to a company A assignment');
select throws_ok(
  format($$ select public.save_assignment('{"id":"%s","company_id":"%s","client_id":"%s","starts_on":"2026-11-02","ends_on":"2026-11-03","start_time":"08:00","end_time":"17:00"}') $$,
    gen_random_uuid(), current_setting('t.b'), current_setting('t.client')),
  'P0001', 'not_found', 'company B cannot use a company A client');

select * from finish();
rollback;
