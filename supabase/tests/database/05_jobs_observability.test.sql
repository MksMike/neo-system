-- Job queue (ADR 0014) and observability storage (ADR 0022).
begin;
create extension if not exists pgtap with schema extensions;
select plan(25);

create function pg_temp.as_service_role() returns void language plpgsql as $$
begin
  perform set_config('role', 'service_role', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
end $$;

select set_config('t.admin', tests.create_platform_admin('admin@neo.test')::text, true);
select set_config('t.user', tests.create_user('user@neo.test')::text, true);

-- Jobs already in the local database (dev seed, end-to-end runs) wait until after the test,
-- so the claims below see only the test jobs. The transaction is rolled back at the end.
update public.job set run_after = now() + interval '1 day';

-- Arrange: three due jobs, one in the future
insert into public.job (id, type, payload, run_after, max_attempts) values
  ('00000000-0000-0000-0000-00000000000a', 'test.alpha', '{}', now() - interval '3 minutes', 2),
  ('00000000-0000-0000-0000-00000000000b', 'test.bravo', '{}', now() - interval '2 minutes', 5),
  ('00000000-0000-0000-0000-00000000000c', 'test.charlie', '{}', now() - interval '1 minute', 5),
  ('00000000-0000-0000-0000-00000000000d', 'test.future', '{}', now() + interval '1 hour', 5);

-- ---------------------------------------------------------------------------
-- Who can run the queue
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.user')::uuid);
select throws_ok($$ select * from public.claim_jobs(10) $$, '42501', null, 'a signed-in user cannot claim jobs');
select throws_ok($$ select public.ingest_observability('[]', '[]') $$, '42501', null, 'a signed-in user cannot write events');

-- ---------------------------------------------------------------------------
-- Claim, complete, fail
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
select pg_temp.as_service_role();
select is(
  (select array_agg(type order by run_after) from public.claim_jobs(2)),
  array['test.alpha', 'test.bravo'], 'claim returns the oldest due jobs first, up to the limit'
);
select is(
  (select array_agg(type) from public.claim_jobs(10)),
  array['test.charlie'], 'a second claim skips running jobs and future jobs'
);
select is((select status || ':' || attempts from public.job where type = 'test.alpha'), 'running:1',
  'a claimed job is running with one attempt');

select public.complete_job('00000000-0000-0000-0000-00000000000b');
select is((select status from public.job where type = 'test.bravo'), 'done', 'complete_job marks done');

select is(public.fail_job('00000000-0000-0000-0000-00000000000c', 'boom'), 'pending', 'a failure retries');
select ok(
  (select run_after > now() + interval '50 seconds' and last_error = 'boom' from public.job where type = 'test.charlie'),
  'the retry waits (backoff) and keeps the error'
);

-- alpha has max_attempts 2: second failure is final
select public.fail_job('00000000-0000-0000-0000-00000000000a', 'first');
update public.job set run_after = now() - interval '1 second' where type = 'test.alpha';
select is((select count(*)::int from public.claim_jobs(10) where type = 'test.alpha'), 1, 'a pending retry can be claimed again');
select is(public.fail_job('00000000-0000-0000-0000-00000000000a', 'second'), 'failed',
  'after max_attempts the job is failed');

-- a dead runner: lock expired -> reclaimable
update public.job set status = 'running', locked_until = now() - interval '1 second' where type = 'test.future';
select is((select count(*)::int from public.claim_jobs(10) where type = 'test.future'), 1,
  'a job whose lock expired is claimed again');

-- ---------------------------------------------------------------------------
-- Retry by the Super Admin
-- ---------------------------------------------------------------------------

select tests.authenticate_as(current_setting('t.user')::uuid);
select throws_ok($$ select public.retry_job('00000000-0000-0000-0000-00000000000a') $$, 'P0001', 'forbidden',
  'a regular user cannot retry jobs');
select tests.authenticate_as(current_setting('t.admin')::uuid);
select public.retry_job('00000000-0000-0000-0000-00000000000a');
select is((select status || ':' || attempts from public.job where type = 'test.alpha'), 'pending:0',
  'the Super Admin retries a failed job');
select throws_ok($$ select public.retry_job('00000000-0000-0000-0000-00000000000b') $$, 'P0001', 'conflict',
  'only failed jobs can be retried');

-- ---------------------------------------------------------------------------
-- Events and metrics
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
select pg_temp.as_service_role();
select public.ingest_observability(
  '[{"code":"AUTH.LOGIN.FAILED","severity":"warn","request_id":"r1","route":"/login","data":{"reason":"pin"}},
    {"code":"APP.UNHANDLED.ERROR","severity":"critical","request_id":"r2","route":"/super"}]',
  '[{"kind":"request","name":"/test-super","duration_ms":40},
    {"kind":"request","name":"/test-super","duration_ms":300},
    {"kind":"request","name":"/test-super","duration_ms":6000,"error":true}]'
);
select is((select count(*)::int from public.system_event where request_id in ('r1', 'r2')), 2, 'events are stored');
select is(
  (select count || ':' || error_count || ':' || max_ms || ':' || histogram::text from public.metric_minute where name = '/test-super'),
  '3:1:6000:{1,0,0,1,0,0,0,1}', 'metrics are aggregated per minute with a latency histogram'
);
select public.ingest_observability('[]', '[{"kind":"request","name":"/test-super","duration_ms":90}]');
select is((select count || ':' || histogram::text from public.metric_minute where name = '/test-super'),
  '4:{1,1,0,1,0,0,0,1}', 'a second batch adds to the same minute');
select tests.clear_authentication();
select is(app.histogram_p95(array[90, 5, 0, 0, 0, 0, 0, 5]), 100, 'p95 ignores the slowest 5%');
select is(app.histogram_p95(array[90, 4, 0, 0, 0, 0, 0, 6]), 10000, 'p95 lands in the slowest bucket when more than 5% are slow');
select is(app.histogram_p95(array[100, 0, 0, 0, 0, 0, 0, 0]), 50, 'p95 of fast requests');

select pg_temp.as_service_role();
select throws_ok(
  $$ select public.ingest_observability('[{"code":"not a code","severity":"info"}]', '[]') $$,
  '23514', null, 'an event without a catalog-shaped code is refused'
);

select tests.authenticate_as(current_setting('t.user')::uuid);
select is((select count(*)::int from public.system_event), 0, 'a regular user reads no events');
select tests.authenticate_as(current_setting('t.admin')::uuid);
select is((select count(*)::int from public.system_event where request_id in ('r1', 'r2')), 2,
  'the Super Admin reads the events');
select is(
  public.mark_events_seen(array(select id from public.system_event where severity = 'critical' and request_id = 'r2')),
  1, 'the Super Admin marks the critical alert as seen'
);

-- Retention: older than 30 days goes away (lands in the default partition if its month has none)
select tests.clear_authentication();
insert into public.system_event (at, code, severity) values (now() - interval '45 days', 'APP.TEST.OLD', 'info');
select app.observability_retention();
select is((select count(*)::int from public.system_event where code = 'APP.TEST.OLD'), 0,
  'events older than 30 days are removed');

select * from finish();
rollback;
