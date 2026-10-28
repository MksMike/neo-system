-- Company page changes with optimistic concurrency (SA-09, ADR 0020, R00-05).
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin-sa09@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.c', public.provision_company(tests.company_payload('TDETAIL', null, '{employees}'))::text, true);

-- ---------------------------------------------------------------------------
-- Modules: the screen sends what it saw
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ select public.set_company_modules(current_setting('t.c')::uuid, '{employees,learning}', null, '{organizations}') $$,
  'P0001', 'conflict', 'a module change based on an old screen is refused'
);
select is(
  public.set_company_modules(current_setting('t.c')::uuid, '{employees,learning}', '2026-11-10', '{employees}') -> 'enabled',
  '["employees", "learning"]'::jsonb, 'a module change based on the current modules goes through'
);
select is(
  (select valid_from::text from public.company_module
   where company_id = current_setting('t.c')::uuid and module_key = 'learning' and deleted_at is null),
  '2026-11-10', 'R00-05 the new module starts on the chosen date'
);
select lives_ok(
  $$ select public.set_company_modules(current_setting('t.c')::uuid, '{employees}', null, '{learning,employees}') $$,
  'the expected list ignores order'
);

-- ---------------------------------------------------------------------------
-- Contract: the screen sends the contract it saw
-- ---------------------------------------------------------------------------

select set_config('t.ct', (select id::text from public.contract where company_id = current_setting('t.c')::uuid and valid_to is null), true);

select throws_ok(
  $$ select public.change_contract(current_setting('t.c')::uuid, '{"type":"monthly","price_yen":60000,"payment_method":"transfer"}', '2026-12-03', gen_random_uuid()) $$,
  'P0001', 'conflict', 'a contract change based on an old screen is refused'
);
select set_config('t.ct2', public.change_contract(current_setting('t.c')::uuid,
  '{"type":"monthly","price_yen":60000,"payment_method":"transfer"}', '2026-12-03', current_setting('t.ct')::uuid)::text, true);
select is(
  (select valid_to::text from public.contract where id = current_setting('t.ct')::uuid),
  '2026-12-02', 'R00-05 the previous version ends the day before'
);
select is(
  (select price_yen::int from public.contract where id = current_setting('t.ct2')::uuid),
  60000, 'the new version has the new price'
);
select throws_ok(
  $$ select public.change_contract(current_setting('t.c')::uuid, '{"type":"monthly","price_yen":50000,"payment_method":"cash"}', '2026-11-20') $$,
  'P0001', 'validation', 'a version scheduled for later cannot be replaced from an earlier date'
);
select lives_ok(
  $$ select public.change_contract(current_setting('t.c')::uuid, '{"type":"monthly","price_yen":65000,"payment_method":"cash"}', '2026-12-03') $$,
  'the scheduled version can be replaced on its own date'
);

select * from finish();
rollback;
