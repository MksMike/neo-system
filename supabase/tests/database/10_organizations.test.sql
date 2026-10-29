-- Layer 04: organizations, client chain and sites (D-02).
begin;
create extension if not exists pgtap with schema extensions;
select plan(26);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin-l04@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.a', public.provision_company(tests.company_payload('TORGA', null, '{organizations}'))::text, true);
select set_config('t.b', public.provision_company(tests.company_payload('TORGB', null, '{organizations}'))::text, true);
select set_config('t.nomod', public.provision_company(tests.company_payload('TORGN', null, '{employees}'))::text, true);
select tests.clear_authentication();

select set_config('t.owner_a', tests.create_user('owner-a-l04@neo.test')::text, true);
select set_config('t.owner_b', tests.create_user('owner-b-l04@neo.test')::text, true);
select set_config('t.coord_a', tests.create_user('coord-a-l04@neo.test')::text, true);
select set_config('t.emp_a', tests.create_user('emp-a-l04@neo.test')::text, true);
select tests.add_member(current_setting('t.owner_a')::uuid, current_setting('t.a')::uuid, 'owner');
select tests.add_member(current_setting('t.owner_a')::uuid, current_setting('t.nomod')::uuid, 'owner');
select tests.add_member(current_setting('t.owner_b')::uuid, current_setting('t.b')::uuid, 'owner');
select tests.add_member(current_setting('t.coord_a')::uuid, current_setting('t.a')::uuid, 'coordinator');
select tests.add_member(current_setting('t.emp_a')::uuid, current_setting('t.a')::uuid, 'employee');

select set_config('t.client', gen_random_uuid()::text, true);
select set_config('t.payload', jsonb_build_object(
  'id', current_setting('t.client'), 'company_id', current_setting('t.a'),
  'name', '株式会社大成建設', 'is_client', true, 'postal_code', '1080075'
)::text, true);

-- ---------------------------------------------------------------------------
-- Owner creates, edits and is protected against duplicates
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_a')::uuid);
select is(
  public.save_organization(current_setting('t.payload')::jsonb) ->> 'version', '1',
  'the owner creates a client with the id from the screen'
);
select is(
  public.save_organization(current_setting('t.payload')::jsonb) ->> 'id', current_setting('t.client'),
  'sending the same creation again returns the same client (ADR 0020)'
);
select is((select count(*)::int from public.organization where company_id = current_setting('t.a')::uuid), 1,
  'the retry did not create a second client');
select throws_ok(
  format($$ select public.save_organization('{"id":"%s","company_id":"%s","name":"(株)大成建設"}') $$,
    gen_random_uuid(), current_setting('t.a')),
  'P0001', 'conflict', 'R04-02 (株) and 株式会社 are the same organization'
);
select is(
  public.save_organization(current_setting('t.payload')::jsonb || '{"version":1,"name":"大成建設株式会社","address":"東京都港区"}') ->> 'version',
  '2', 'editing with the current version goes through'
);
select throws_ok(
  $$ select public.save_organization(current_setting('t.payload')::jsonb || '{"version":1,"name":"大成建設"}') $$,
  'P0001', 'conflict', 'editing with an old version is refused (ADR 0020)'
);

-- ---------------------------------------------------------------------------
-- Client chain: quick registration, colors, duplicates
-- ---------------------------------------------------------------------------

select set_config('t.link1', gen_random_uuid()::text, true);
select is(
  public.link_subcontractor(jsonb_build_object(
    'id', current_setting('t.link1'), 'company_id', current_setting('t.a'), 'client_id', current_setting('t.client'),
    'organization', jsonb_build_object('name', '内山工業株式会社')
  )) ->> 'color', 'teiji', 'R04-03 the first subcontractor gets the first color'
);
select is(
  (select count(*)::int from public.organization where company_id = current_setting('t.a')::uuid and name = '内山工業株式会社'),
  1, 'the quick "+" created the subcontractor organization'
);
select is(
  public.link_subcontractor(jsonb_build_object(
    'id', gen_random_uuid(), 'company_id', current_setting('t.a'), 'client_id', current_setting('t.client'),
    'organization', jsonb_build_object('name', '(株)SFK'), 'position', 2
  )) ->> 'color', 'yukyu', 'R04-03 the next subcontractor gets the next free color'
);
select throws_ok(
  format($$ select public.link_subcontractor('{"id":"%s","company_id":"%s","client_id":"%s","organization":{"name":"内山工業"}}') $$,
    gen_random_uuid(), current_setting('t.a'), current_setting('t.client')),
  'P0001', 'conflict', 'R04-02 the quick "+" reuses an existing organization and refuses a second link'
);
select is(
  (select count(*)::int from public.organization where company_id = current_setting('t.a')::uuid),
  3, 'the refused quick "+" did not create a duplicate organization'
);
select is(
  (select name from public.find_organizations(current_setting('t.a')::uuid, '内山')),
  '内山工業株式会社', 'the search finds the organization before a quick registration'
);
select is(
  public.update_chain(jsonb_build_object('id', current_setting('t.link1'), 'company_id', current_setting('t.a'),
    'version', 1, 'color', 'chushi', 'abbreviation', 'UCH')) ->> 'color',
  'chushi', 'the color and the abbreviation can be changed'
);
select throws_ok(
  format($$ select public.update_chain('{"id":"%s","company_id":"%s","version":1,"color":"pending"}') $$,
    current_setting('t.link1'), current_setting('t.a')),
  'P0001', 'conflict', 'a chain change with an old version is refused'
);
select throws_ok(
  format($$ select public.update_chain('{"id":"%s","company_id":"%s","version":2,"color":"rosa"}') $$,
    current_setting('t.link1'), current_setting('t.a')),
  '23514', null, 'only colors of the design tokens are accepted'
);

-- ---------------------------------------------------------------------------
-- Sites
-- ---------------------------------------------------------------------------

select set_config('t.site', gen_random_uuid()::text, true);
select is(
  public.save_site(jsonb_build_object('id', current_setting('t.site'), 'company_id', current_setting('t.a'),
    'client_id', current_setting('t.client'), 'name', '品川工場')) ->> 'radius_m',
  '300', 'a site gets the default geolocation radius'
);

-- ---------------------------------------------------------------------------
-- Isolation between companies and roles (CLAUDE.md rule 1)
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_b')::uuid);
select is((select count(*)::int from public.organization), 0, 'company B sees none of company A organizations');
select is((select count(*)::int from public.site), 0, 'company B sees none of company A sites');
select throws_ok(
  $$ select public.save_organization(current_setting('t.payload')::jsonb || '{"version":2,"name":"乗っ取り"}') $$,
  'P0001', 'forbidden', 'company B cannot edit company A data'
);
select throws_ok(
  format($$ select public.save_organization('{"id":"%s","company_id":"%s","name":"B社"}') $$,
    current_setting('t.client'), current_setting('t.b')),
  'P0001', 'not_found', 'company B cannot take over company A id'
);

select tests.authenticate_as(current_setting('t.coord_a')::uuid);
select is((select count(*)::int from public.organization), 3, 'the coordinator reads the organizations');
select throws_ok(
  format($$ select public.save_organization('{"id":"%s","company_id":"%s","name":"新規"}') $$,
    gen_random_uuid(), current_setting('t.a')),
  'P0001', 'forbidden', 'the coordinator does not register organizations'
);

select tests.authenticate_as(current_setting('t.emp_a')::uuid);
select is((select count(*)::int from public.organization), 0, 'an employee does not read organizations');

-- ---------------------------------------------------------------------------
-- Module off and company without writing (R00-03, R00-06)
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner_a')::uuid);
select throws_ok(
  format($$ select public.save_organization('{"id":"%s","company_id":"%s","name":"X"}') $$,
    gen_random_uuid(), current_setting('t.nomod')),
  'P0001', 'module_disabled', 'R00-03 the module off is refused in the database'
);

select tests.clear_authentication();
update public.company set status = 'read_only' where id = current_setting('t.a')::uuid;
select tests.authenticate_as(current_setting('t.owner_a')::uuid);
select throws_ok(
  format($$ select public.save_organization('{"id":"%s","company_id":"%s","name":"Y"}') $$,
    gen_random_uuid(), current_setting('t.a')),
  'P0001', 'company_read_only', 'R00-06 a read-only company does not write'
);
select is((select count(*)::int from public.organization), 3, 'a read-only company still reads');

select * from finish();
rollback;
