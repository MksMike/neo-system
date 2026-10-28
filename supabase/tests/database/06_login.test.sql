-- Owner invitation acceptance and session summary (SA-06, ADR 0012, ADR 0016, ADR 0024).
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select set_config('t.c', public.provision_company(tests.company_payload('TINVITE'))::text, true);
select set_config('t.inv', (select id::text from public.owner_invitation where company_id = current_setting('t.c')::uuid), true);

-- The invited e-mail (tinvite@example.com) and another person
select tests.clear_authentication();
select set_config('t.owner', tests.create_user('tinvite@example.com')::text, true);
select set_config('t.other', tests.create_user('someone-else@example.com')::text, true);

-- ---------------------------------------------------------------------------
-- Who can accept
-- ---------------------------------------------------------------------------

select tests.authenticate_as_anon();
select throws_ok($$ select public.accept_owner_invitation(current_setting('t.inv')::uuid) $$, '42501', null,
  'anon cannot accept an invitation');

select tests.authenticate_as(current_setting('t.other')::uuid, 'aal1');
select throws_ok($$ select public.accept_owner_invitation(current_setting('t.inv')::uuid) $$, 'P0001', 'forbidden',
  'another e-mail cannot accept the invitation');
select throws_ok($$ select public.accept_owner_invitation(gen_random_uuid()) $$, 'P0001', 'not_found',
  'an unknown invitation is not found');

-- ---------------------------------------------------------------------------
-- Accept
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.owner')::uuid, 'aal1');
select is((public.my_session() -> 'memberships'), '[]'::jsonb, 'before accepting, the person has no company');
select is(public.accept_owner_invitation(current_setting('t.inv')::uuid), current_setting('t.c')::uuid,
  'the invited e-mail accepts and gets the company id');
select is(
  (public.my_session() -> 'memberships' -> 0 ->> 'role') || ':' || (public.my_session() -> 'memberships' -> 0 ->> 'code'),
  'owner:TINVITE', 'after accepting, the person is owner of the company'
);
select is((public.my_session() ->> 'is_platform_admin')::boolean, false, 'the owner is not Super Admin');
select is((select display_name from public.user_profile where user_id = current_setting('t.owner')::uuid),
  'Owner TINVITE', 'the profile takes the name from the invitation');
select throws_ok($$ select public.accept_owner_invitation(current_setting('t.inv')::uuid) $$, 'P0001', 'conflict',
  'an invitation cannot be accepted twice');
select is((public.my_company_access(current_setting('t.c')::uuid) ->> 'code'), 'TINVITE',
  'the new owner reads the access summary of the company');

select tests.clear_authentication();
select is((select status from public.owner_invitation where id = current_setting('t.inv')::uuid), 'accepted',
  'the invitation is marked accepted');
select is(
  (select count(*)::int from public.platform_audit_log where action = 'owner_invitation.accepted' and company_id = current_setting('t.c')::uuid),
  1, 'the acceptance is logged'
);

-- ---------------------------------------------------------------------------
-- Super Admin session
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.admin')::uuid, 'aal1');
select is((public.my_session() ->> 'is_platform_admin')::boolean, true,
  'ADR 0024 the Super Admin is recognized with e-mail and password (require_mfa off)');

select * from finish();
rollback;
