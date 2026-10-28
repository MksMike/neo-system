-- Charges, payments and status (R00-06, R00-07, R00-13 to R00-16, R00-20).
begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

set local app.today_override = '2026-11-03';
select set_config('t.admin', tests.create_platform_admin('admin@neo.test')::text, true);
select set_config('t.owner', tests.create_user('owner@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.admin')::uuid);

-- DEMO: monthly ¥55,000 from 2026-11-03; first charge (Nov 3 – Dec 2) is due on Nov 3.
select set_config('t.c', public.provision_company(tests.company_payload('DEMO'))::text, true);
select set_config('t.ch1', (select id::text from public.saas_charge where company_id = current_setting('t.c')::uuid), true);

-- ---------------------------------------------------------------------------
-- R00-15 status follows the days after the due date
-- ---------------------------------------------------------------------------

select is(public.recompute_company_status('2026-11-03'), 0, 'on the due date nothing changes');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'active', 'R00-15 due date itself is still on time');

select public.recompute_company_status('2026-11-04');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'past_due', 'R00-15 1 day late -> past_due');

select public.recompute_company_status('2026-11-10');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'past_due', 'R00-15 7 days late -> still past_due');

select public.recompute_company_status('2026-11-11');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'read_only', 'R00-15 8 days late -> read_only');

-- R00-06 read_only and blocked refuse writes
select tests.clear_authentication();
select tests.add_member(current_setting('t.owner')::uuid, current_setting('t.c')::uuid, 'owner');
select tests.authenticate_as(current_setting('t.owner')::uuid);
select is(public.company_can_write(current_setting('t.c')::uuid), false, 'R00-06 read_only cannot write');
select is((public.my_company_access(current_setting('t.c')::uuid) ->> 'show_past_due_banner')::boolean, false,
  'the past-due banner is only for past_due');
select tests.authenticate_as(current_setting('t.admin')::uuid);

select public.recompute_company_status('2026-11-25');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'read_only', 'R00-15 22 days late -> still read_only');
select public.recompute_company_status('2026-11-26');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'blocked', 'R00-15 23 days late -> blocked');
select is(public.company_can_write(current_setting('t.c')::uuid), false, 'R00-06 blocked cannot write');
select is(
  (select count(*)::int from public.company_status_event where company_id = current_setting('t.c')::uuid and source = 'auto'),
  3, 'each automatic change is in the status history'
);

-- ---------------------------------------------------------------------------
-- R00-16 short payment: the Super Admin decides; R00-07 paid_until follows the period
-- ---------------------------------------------------------------------------

set local app.today_override = '2026-11-27';
select throws_ok(
  $$ select public.register_saas_payment(current_setting('t.ch1')::uuid, '{"amount_yen":54560,"method":"transfer"}') $$,
  'P0001', 'validation', 'R00-16 a short payment needs a settlement choice'
);
select is(
  public.register_saas_payment(current_setting('t.ch1')::uuid,
    '{"amount_yen":54560,"method":"transfer","settlement":"leave_open"}') ->> 'charge_status',
  'partial', 'R00-16 leave_open keeps the charge partial'
);
select is((select status from public.company where id = current_setting('t.c')::uuid), 'blocked',
  'R00-07 a partial payment does not move paid_until');

select is(
  public.register_saas_payment(current_setting('t.ch1')::uuid,
    '{"amount_yen":440,"method":"transfer","paid_on":"2026-11-27"}') ->> 'paid_until',
  '2026-12-02', 'R00-07 paying the rest moves paid_until to the end of the period, not the payment date'
);
select is((select status from public.company where id = current_setting('t.c')::uuid), 'active',
  'paying brings the company back to active at once');

-- Second period (Dec 3 – Jan 2) generated 10 days before; settled with the bank fee
select public.generate_saas_charges('2026-11-23');
select set_config('t.ch2', (select id::text from public.saas_charge
  where company_id = current_setting('t.c')::uuid and period_start = '2026-12-03'), true);
select ok(current_setting('t.ch2') <> '', 'R00-14 the next charge exists 10 days before the period');
select is(
  public.register_saas_payment(current_setting('t.ch2')::uuid,
    '{"amount_yen":54340,"method":"transfer","settlement":"settle_with_fee"}') ->> 'paid_until',
  '2027-01-02', 'R00-16 settle_with_fee closes the charge and moves paid_until'
);
select is((select fee_yen from public.saas_charge where id = current_setting('t.ch2')::uuid), 660::bigint,
  'R00-16 the difference is recorded as fee');

select throws_ok(
  $$ select public.register_saas_payment(current_setting('t.ch2')::uuid, '{"amount_yen":1,"method":"transfer"}') $$,
  'P0001', 'conflict', 'a paid charge cannot be paid again'
);

-- ---------------------------------------------------------------------------
-- R00-08 suspend / reactivate; R00-13 investor; R00-12 partner; R00-20 cancel later
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ select public.suspend_company(current_setting('t.c')::uuid, '  ') $$,
  'P0001', 'validation', 'R00-08 suspending requires a reason'
);
select public.suspend_company(current_setting('t.c')::uuid, 'teste de suspensão');
select public.recompute_company_status('2026-11-28');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'blocked',
  'R00-08 a suspended company is not changed by the automatic status');
select is(public.reactivate_company(current_setting('t.c')::uuid, 'resolvido'), 'active',
  'R00-08 reactivating recomputes the status');

-- R00-20 cancel on a future date: keeps operating until then
select is(public.cancel_company(current_setting('t.c')::uuid, 'fim do contrato', '2026-12-31'), 'active',
  'R00-20 a cancellation in the future keeps the company operating');
set local app.today_override = '2026-12-31';
select public.recompute_company_status('2026-12-31');
select is((select status from public.company where id = current_setting('t.c')::uuid), 'canceled',
  'R00-20 on the date the company becomes canceled');

-- Investor: only by migration (simulated as postgres), never canceled
select set_config('t.sugita', public.provision_company(tests.company_payload('SUGITA', '{"type":"partner"}'))::text, true);
select tests.clear_authentication();
update public.company set is_investor = true where id = current_setting('t.sugita')::uuid;
select tests.authenticate_as(current_setting('t.admin')::uuid);

select throws_ok(
  $$ select public.cancel_company(current_setting('t.sugita')::uuid, 'teste') $$,
  'P0001', 'forbidden', 'R00-13 the investor cannot be canceled'
);
select public.recompute_company_status('2030-01-01');
select is((select status from public.company where id = current_setting('t.sugita')::uuid), 'active',
  'R00-12 a partner never changes status by itself');

select * from finish();
rollback;
