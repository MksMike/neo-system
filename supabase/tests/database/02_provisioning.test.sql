-- Provisioning (R00-01, R00-02, R00-12, R00-17, ADR 0012).
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);

-- ---------------------------------------------------------------------------
-- Happy path: monthly contract, modules, invitation, job, log
-- ---------------------------------------------------------------------------

select set_config('t.demo', public.provision_company(tests.company_payload('TDEMO', null, '{employees}'))::text, true);

select is((select status from public.company where id = current_setting('t.demo')::uuid), 'active',
  'a monthly company without trial starts active');
select is(
  (select type || ':' || price_yen || ':' || billing_start || ':' || paid_until from public.contract
   where company_id = current_setting('t.demo')::uuid and valid_to is null),
  'monthly:55000:2026-11-03:2026-11-02', 'the contract starts today and nothing is paid yet'
);
select is(
  (select count(*)::int from public.saas_charge where company_id = current_setting('t.demo')::uuid),
  1, 'R00-14 the first charge is created at once (period starts today)'
);
select is(
  (select status from public.owner_invitation where company_id = current_setting('t.demo')::uuid),
  'pending', 'the owner invitation is pending'
);
select is(
  (select j.type from public.job j join public.owner_invitation i on i.job_id = j.id
   where i.company_id = current_setting('t.demo')::uuid),
  'owner_invitation.send', 'the invitation is sent by the job queue (outbox)'
);
select is(
  (select count(*)::int from public.platform_audit_log
   where company_id = current_setting('t.demo')::uuid and action = 'company.provisioned'),
  1, 'provisioning is logged'
);
select tests.clear_authentication();
select ok(
  (select count(*) > 0 from app.audit_log where company_id = current_setting('t.demo')::uuid and table_name = 'company'),
  'the company row change is in the audit log'
);
select tests.authenticate_as(current_setting('t.admin')::uuid);
select is(
  (select created_by from public.company where id = current_setting('t.demo')::uuid),
  current_setting('t.admin')::uuid, 'created_by is the Super Admin'
);

-- ---------------------------------------------------------------------------
-- R00-01 company code
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ select public.provision_company(tests.company_payload('TDEMO')) $$,
  'P0001', 'conflict', 'R00-01 a company code cannot be reused'
);
select throws_ok(
  $$ select public.provision_company(tests.company_payload('a b')) $$,
  'P0001', 'validation', 'R00-01 a code with spaces or lowercase symbols is refused'
);
select set_config('t.lower', public.provision_company(tests.company_payload('Tlower1'))::text, true);
select is((select code from public.company where id = current_setting('t.lower')::uuid), 'TLOWER1',
  'R00-01 the code is stored in uppercase');

-- ---------------------------------------------------------------------------
-- R00-02 all or nothing
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ select public.provision_company(tests.company_payload('TBROKEN', null, '{employees,not_a_module}')) $$,
  'P0001', 'validation', 'R00-02 an unknown module fails the provisioning'
);
select is((select count(*)::int from public.company where code = 'TBROKEN'), 0,
  'R00-02 the failed provisioning left no company');
select is((select count(*)::int from public.owner_invitation where email = 'tbroken@example.com'), 0,
  'R00-02 the failed provisioning left no invitation');

select throws_ok(
  $$ select public.provision_company(tests.company_payload('TNOPRICE', '{"type":"monthly","payment_method":"transfer"}')) $$,
  'P0001', 'validation', 'a paid contract needs a price'
);

-- ---------------------------------------------------------------------------
-- R00-12 partner and R00-17 trial
-- ---------------------------------------------------------------------------

select set_config('t.partner', public.provision_company(tests.company_payload('TSUGITA', '{"type":"partner"}'))::text, true);
select is(
  (select status || ':' || (select count(*) from public.saas_charge where company_id = c.id)
   from public.company c where c.id = current_setting('t.partner')::uuid),
  'active:0', 'R00-12 a partner company is active and has no charges'
);

select set_config('t.trial', public.provision_company(tests.company_payload('TTRIAL',
  '{"type":"monthly","price_yen":30000,"payment_method":"cash","trial_days":14}'))::text, true);
select is((select status from public.company where id = current_setting('t.trial')::uuid), 'trial',
  'R00-17 a company with trial days starts in trial');
select is(
  (select trial_ends_on || ':' || billing_start from public.contract where company_id = current_setting('t.trial')::uuid),
  '2026-11-16:2026-11-17', 'R00-17 billing starts the day after the trial ends'
);
select is(
  (select count(*)::int from public.saas_charge where company_id = current_setting('t.trial')::uuid),
  0, 'R00-14 during the trial there is no charge yet'
);
select public.generate_saas_charges('2026-11-07');
select is(
  (select period_start::text from public.saas_charge where company_id = current_setting('t.trial')::uuid),
  '2026-11-17', 'R00-14 the first charge after the trial is created 10 days before it starts'
);

select * from finish();
rollback;
