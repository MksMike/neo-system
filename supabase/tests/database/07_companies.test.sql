-- Companies list and creation from the screen (SA-08, ADR 0020).
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin-sa08@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);

-- ---------------------------------------------------------------------------
-- Id generated on the screen: a retry returns the same company (ADR 0020)
-- ---------------------------------------------------------------------------

select set_config('t.id', gen_random_uuid()::text, true);
select is(
  public.provision_company(tests.company_payload('TIDEM') || jsonb_build_object('id', current_setting('t.id'))),
  current_setting('t.id')::uuid, 'the company gets the id generated on the screen'
);
select is(
  public.provision_company(tests.company_payload('TIDEM') || jsonb_build_object('id', current_setting('t.id'))),
  current_setting('t.id')::uuid, 'sending the same request again returns the same company'
);
select is((select count(*)::int from public.company where code = 'TIDEM'), 1, 'the retry did not create a second company');
select is((select count(*)::int from public.owner_invitation where company_id = current_setting('t.id')::uuid), 1,
  'the retry did not queue a second invitation');
select throws_ok(
  format($$ select public.provision_company(tests.company_payload('TOTHER') || '{"id":"%s"}') $$, current_setting('t.id')),
  'P0001', 'conflict', 'the same id with another code is a conflict'
);
select throws_ok(
  $$ select public.provision_company(tests.company_payload('TBADID') || '{"id":"not-a-uuid"}') $$,
  'P0001', 'validation', 'an invalid id is refused'
);
select throws_ok(
  $$ select public.provision_company(tests.company_payload('TIDEM')) $$,
  'P0001', 'conflict', 'R00-01 the code stays unique without an id'
);

-- ---------------------------------------------------------------------------
-- List: search, filters, order, pages
-- ---------------------------------------------------------------------------

select public.provision_company(tests.company_payload('TLSTA', '{"type":"partner"}'));
select public.provision_company(tests.company_payload('TLSTB', '{"type":"annual","price_yen":600000,"payment_method":"cash"}', '{employees,organizations}'));
select public.provision_company(tests.company_payload('TLSTC'));

select is(
  (public.list_companies('{"q":"tlst","sort":"code"}') -> 'total')::int, 3,
  'search finds by code, ignoring case'
);
select is(
  (select jsonb_agg(i ->> 'code') from jsonb_array_elements(public.list_companies('{"q":"TLST","sort":"code","dir":"desc"}') -> 'items') i),
  '["TLSTC", "TLSTB", "TLSTA"]'::jsonb, 'sorts by code descending'
);
select is(
  (select jsonb_agg(i ->> 'code') from jsonb_array_elements(public.list_companies('{"q":"TLST","contract_type":"partner"}') -> 'items') i),
  '["TLSTA"]'::jsonb, 'filters by contract type'
);
select is(
  public.list_companies('{"q":"TLSTB"}') #>> '{items,0,module_count}', '2',
  'counts the modules on today'
);
select is(
  public.list_companies('{"q":"TLSTB"}') #>> '{items,0,price_yen}', '600000',
  'shows the current contract'
);
select is(
  (select jsonb_agg(i ->> 'code') from jsonb_array_elements(public.list_companies('{"q":"TLST","sort":"code","page":2,"page_size":2}') -> 'items') i),
  '["TLSTC"]'::jsonb, 'second page of two'
);
select is(
  (public.list_companies('{"q":"T_ST"}') -> 'total')::int, 0,
  'search treats _ and % as text, not as wildcards'
);
select throws_ok(
  $$ select public.list_companies('{"sort":"legal_name; drop table x"}') $$,
  'P0001', 'validation', 'an unknown sort is refused'
);

-- ---------------------------------------------------------------------------
-- Only the Super Admin
-- ---------------------------------------------------------------------------

select set_config('t.user', tests.create_user('someone-sa08@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.user')::uuid);
select throws_ok(
  $$ select public.list_companies() $$,
  'P0001', 'forbidden', 'a regular user cannot list companies'
);

select * from finish();
rollback;
