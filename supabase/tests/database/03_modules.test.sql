-- Modules (R00-03, R00-04, R00-05).
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.c', public.provision_company(tests.company_payload('MODS'))::text, true);

-- R00-03 base modules are always on; optional ones only when contracted
select ok(public.has_module(current_setting('t.c')::uuid, 'platform'), 'R00-03 base module platform is always on');
select ok(not public.has_module(current_setting('t.c')::uuid, 'employees'), 'R00-03 an optional module starts off');

-- R00-04 turning a module on turns its dependencies on
select is(
  public.set_company_modules(current_setting('t.c')::uuid, '{scheduling}') -> 'auto_added',
  '["employees", "organizations"]'::jsonb,
  'R00-04 scheduling turns on organizations and employees'
);
select ok(public.has_module(current_setting('t.c')::uuid, 'employees'), 'R00-04 employees is now on');

select public.set_company_modules(current_setting('t.c')::uuid, '{}');
select is(
  public.set_company_modules(current_setting('t.c')::uuid, '{attendance}') -> 'auto_added',
  '["employees", "organizations", "scheduling"]'::jsonb,
  'R00-04 dependencies are followed transitively (attendance -> scheduling -> organizations, employees)'
);

-- R00-04 turning off a module that another one needs is refused
select throws_ok(
  $$ select public.set_company_modules(current_setting('t.c')::uuid, '{attendance,scheduling,organizations}') $$,
  'P0001', 'conflict', 'R00-04 turning employees off while scheduling needs it is refused'
);

-- finance needs billing OR payroll; the system cannot guess which one
select throws_ok(
  $$ select public.set_company_modules(current_setting('t.c')::uuid, '{attendance,scheduling,organizations,employees,finance}') $$,
  'P0001', 'validation', 'finance alone is refused: it needs billing or payroll'
);
select lives_ok(
  $$ select public.set_company_modules(current_setting('t.c')::uuid, '{attendance,scheduling,organizations,employees,documents,payroll,finance}') $$,
  'finance with payroll is accepted'
);

-- Turning off keeps history (R00-05)
select lives_ok(
  $$ select public.set_company_modules(current_setting('t.c')::uuid, '{attendance,scheduling,organizations,employees,documents,payroll}', '2026-11-10') $$,
  'finance can be turned off from a future date'
);
select ok(public.has_module(current_setting('t.c')::uuid, 'finance'), 'R00-05 finance is still on until the date');
select is(
  (select valid_to from public.company_module
   where company_id = current_setting('t.c')::uuid and module_key = 'finance' and deleted_at is null),
  '2026-11-09'::date, 'R00-05 the period closes the day before, keeping history'
);
select throws_ok(
  $$ select public.set_company_modules(current_setting('t.c')::uuid, '{}', '2026-11-01') $$,
  'P0001', 'validation', 'R00-05 a change in the past is refused'
);

select * from finish();
rollback;
