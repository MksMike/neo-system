-- Layer 06: assignments, allocations and the calendar (D-04).
begin;
create extension if not exists pgtap with schema extensions;
select plan(25);

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
  'day_rate', 20000, 'tax_rate', 10, 'extra_description', '出張手当',
  'extra_client_amount', 3000, 'extra_employee_amount', 2000
)::text, true);
select is(public.save_assignment(current_setting('t.payload')::jsonb) ->> 'version', '1',
  'the coordinator creates an assignment');
select is(public.save_assignment(current_setting('t.payload')::jsonb) ->> 'id', current_setting('t.asg'),
  'sending the same creation again returns the same assignment');
select throws_ok(
  $$ select public.save_assignment(current_setting('t.payload')::jsonb || '{"version":1,"ends_on":"2026-11-01"}') $$,
  'P0001', 'validation', 'the period cannot end before it starts');
select throws_ok(
  $$ select public.save_assignment(current_setting('t.payload')::jsonb || '{"version":1,"ends_on":"2026-12-15"}') $$,
  'P0001', 'validation', 'R06-06 an assignment is at most one month');

-- ---------------------------------------------------------------------------
-- Days of the employees
-- ---------------------------------------------------------------------------

select is(
  public.add_assignment_employee(jsonb_build_object('company_id', current_setting('t.a'),
    'assignment_id', current_setting('t.asg'), 'employee_id', current_setting('t.e1'))),
  14, 'without dates the employee gets every day of the period, weekends included');
select is(
  public.add_assignment_employee(jsonb_build_object('company_id', current_setting('t.a'),
    'assignment_id', current_setting('t.asg'), 'employee_id', current_setting('t.e1'))),
  0, 'sending the same request again adds nothing');
select is(
  (select day_rate || ':' || status || ':' || client_extra_amount || ':' || employee_extra_amount
   from public.assignment_day where assignment_id = current_setting('t.asg')::uuid
     and employee_id = current_setting('t.e1')::uuid and day = '2026-11-05'),
  '20000:pending:3000:2000', 'R06-07 a new day starts pending with the assignment defaults');
select is(
  public.add_assignment_employee(jsonb_build_object('company_id', current_setting('t.a'),
    'assignment_id', current_setting('t.asg'), 'employee_id', current_setting('t.e2'),
    'starts_on', '2026-11-05', 'ends_on', '2026-11-05')),
  1, 'an employee can be put on a single day');
select throws_ok(
  format($$ select public.add_assignment_employee('{"company_id":"%s","assignment_id":"%s","employee_id":"%s","starts_on":"2026-11-01"}') $$,
    current_setting('t.a'), current_setting('t.asg'), current_setting('t.e2')),
  'P0001', 'validation', 'a day outside the period is refused');

-- R06-08: everything of the day can change, without touching the other days
select set_config('t.day', (select id::text from public.assignment_day
  where assignment_id = current_setting('t.asg')::uuid and employee_id = current_setting('t.e2')::uuid), true);
select is(
  public.save_assignment_day(jsonb_build_object('id', current_setting('t.day'), 'company_id', current_setting('t.a'),
    'version', 1, 'status', 'work', 'period', 'zangyo', 'start_time', '08:00', 'end_time', '19:00',
    'overtime_minutes', 90, 'day_rate', 25000, 'chain_id', current_setting('t.chain'),
    'fine_description', '遅刻', 'fine_amount', 3000)) ->> 'day_rate',
  '25000', 'R06-08 the price of one day can change');
select is(
  (select day_rate from public.assignment_day where assignment_id = current_setting('t.asg')::uuid
     and employee_id = current_setting('t.e1')::uuid and day = '2026-11-05'),
  20000::bigint, 'R06-08 the other employee on the same day keeps the default price');
select throws_ok(
  format($$ select public.save_assignment_day('{"id":"%s","company_id":"%s","version":1,"status":"work","start_time":"08:00","end_time":"17:00"}') $$,
    current_setting('t.day'), current_setting('t.a')),
  'P0001', 'conflict', 'an old version is refused (optimistic concurrency)');

-- Todos teiji / todos folga
select is(public.set_assignment_day_status(current_setting('t.a')::uuid, current_setting('t.asg')::uuid, '2026-11-05', 'teiji'),
  2, 'todos teiji marks every employee of the day');
select is(
  (select status || '/' || period || '/' || overtime_minutes from public.assignment_day
   where assignment_id = current_setting('t.asg')::uuid and day = '2026-11-05'
     and employee_id = current_setting('t.e2')::uuid),
  'work/teiji/0', 'teiji clears the overtime');
select is(public.set_assignment_day_status(current_setting('t.a')::uuid, current_setting('t.asg')::uuid, '2026-11-06', 'off'),
  1, 'todos folga marks the day as 休');

-- R06-02: overlapping hours are refused; a stretch after the first one is accepted
select set_config('t.night', gen_random_uuid()::text, true);
select public.save_assignment(jsonb_build_object('id', current_setting('t.night'), 'company_id', current_setting('t.a'),
  'client_id', current_setting('t.client'), 'starts_on', '2026-11-10', 'ends_on', '2026-11-10',
  'start_time', '16:00', 'end_time', '22:00'));
select throws_ok(
  format($$ select public.add_assignment_employee('{"company_id":"%s","assignment_id":"%s","employee_id":"%s"}') $$,
    current_setting('t.a'), current_setting('t.night'), current_setting('t.e1')),
  'P0001', 'conflict', 'R06-02 overlapping hours on the same day are refused');
select set_config('t.evening', gen_random_uuid()::text, true);
select public.save_assignment(jsonb_build_object('id', current_setting('t.evening'), 'company_id', current_setting('t.a'),
  'client_id', current_setting('t.client'), 'starts_on', '2026-11-10', 'ends_on', '2026-11-10',
  'start_time', '18:00', 'end_time', '22:00'));
select lives_ok(
  format($$ select public.add_assignment_employee('{"company_id":"%s","assignment_id":"%s","employee_id":"%s"}') $$,
    current_setting('t.a'), current_setting('t.evening'), current_setting('t.e1')),
  'R06-02 a second stretch after the first one is accepted');

-- Removing and editing the period
select is(public.remove_assignment_employee(current_setting('t.a')::uuid, current_setting('t.asg')::uuid,
  current_setting('t.e2')::uuid), 1, 'removing an employee removes their days');
select throws_ok(
  $$ select public.save_assignment(current_setting('t.payload')::jsonb || '{"version":1,"ends_on":"2026-11-10"}') $$,
  'P0001', 'validation', 'R06-03 the period cannot shrink below the days');

-- ---------------------------------------------------------------------------
-- Isolation
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_b')::uuid);
select is((select count(*)::int from public.assignment), 0, 'company B sees none of company A assignments');
select is((select count(*)::int from public.assignment_day), 0, 'company B sees none of company A days');
select throws_ok(
  format($$ select public.add_assignment_employee('{"company_id":"%s","assignment_id":"%s","employee_id":"%s"}') $$,
    current_setting('t.b'), current_setting('t.asg'), current_setting('t.e2')),
  'P0001', 'not_found', 'company B cannot put employees on a company A assignment');
select throws_ok(
  format($$ select public.save_assignment_day('{"id":"%s","company_id":"%s","version":3,"status":"off","start_time":"08:00","end_time":"17:00"}') $$,
    current_setting('t.day'), current_setting('t.b')),
  'P0001', 'not_found', 'company B cannot edit a company A day');
select throws_ok(
  format($$ select public.delete_assignment('%s', '%s', 1) $$, current_setting('t.b'), current_setting('t.asg')),
  'P0001', 'not_found', 'company B cannot delete a company A assignment');

-- Deletion is logical
select tests.authenticate_as(current_setting('t.owner')::uuid);
select public.delete_assignment(current_setting('t.a')::uuid, current_setting('t.asg')::uuid, 1);
select is((select count(*)::int from public.assignment_day where assignment_id = current_setting('t.asg')::uuid
  and deleted_at is null), 0, 'deleting an assignment removes its days logically');

select * from finish();
rollback;
