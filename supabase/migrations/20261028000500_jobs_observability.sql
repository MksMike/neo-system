-- Job queue functions (ADR 0014) and observability storage (ADR 0022).
-- Only the server (service_role) runs the queue and writes events; only the Super Admin reads them.

-- ---------------------------------------------------------------------------
-- Job queue: claim with SKIP LOCKED, complete, fail with backoff
-- ---------------------------------------------------------------------------

-- Claims up to p_limit due jobs for p_lock_seconds. Two runners never get the same job.
create function public.claim_jobs(p_limit integer default 10, p_lock_seconds integer default 120)
returns setof public.job
language plpgsql security definer set search_path = ''
as $$
begin
  return query
  update public.job j
  set status = 'running',
      attempts = j.attempts + 1,
      locked_until = now() + make_interval(secs => p_lock_seconds)
  where j.id in (
    select q.id from public.job q
    where q.deleted_at is null
      and (
        (q.status = 'pending' and q.run_after <= now())
        -- a runner that died keeps the job locked only until locked_until
        or (q.status = 'running' and q.locked_until < now())
      )
    order by q.run_after, q.created_at
    limit greatest(1, least(p_limit, 50))
    for update skip locked
  )
  returning j.*;
end
$$;

create function public.complete_job(p_job_id uuid) returns void
language sql security definer set search_path = ''
as $$
  update public.job
  set status = 'done', done_at = now(), locked_until = null, last_error = null
  where id = p_job_id and status = 'running';
$$;

-- Failure: retry with exponential backoff (1, 2, 4, 8… minutes, max 60) until max_attempts.
create function public.fail_job(p_job_id uuid, p_error text) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  next_status text;
begin
  update public.job
  set status = case when attempts >= max_attempts then 'failed' else 'pending' end,
      run_after = case
        when attempts >= max_attempts then run_after
        else now() + make_interval(mins => least(60, power(2, greatest(attempts - 1, 0))::integer))
      end,
      locked_until = null,
      last_error = left(p_error, 2000)
  where id = p_job_id and status = 'running'
  returning status into next_status;
  return next_status;
end
$$;

-- Super Admin: run a failed job again (Saúde do sistema → Fila).
create function public.retry_job(p_job_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform app.require_platform_admin();
  update public.job
  set status = 'pending', attempts = 0, run_after = now(), last_error = null
  where id = p_job_id and status = 'failed';
  if not found then
    perform app.raise('conflict', 'job_not_failed');
  end if;
  perform app.log_platform_action('job.retried', null, jsonb_build_object('job_id', p_job_id));
end
$$;

-- ---------------------------------------------------------------------------
-- Events (ADR 0022): partitioned by month, kept 30 days
-- ---------------------------------------------------------------------------

create table public.system_event (
  id uuid not null default gen_random_uuid(),
  at timestamptz not null default now(),
  code text not null check (code ~ '^[A-Z]+\.[A-Z_]+\.[A-Z_]+$'),
  severity text not null check (severity in ('debug', 'info', 'warn', 'error', 'critical')),
  request_id text check (char_length(request_id) <= 64),
  route text check (char_length(route) <= 200),
  company_id uuid,
  user_id uuid,
  duration_ms integer check (duration_ms >= 0),
  data jsonb not null default '{}',
  seen_at timestamptz, -- critical alerts: marked as seen by the Super Admin
  primary key (id, at)
) partition by range (at);

create index system_event_at_idx on public.system_event (at desc);
create index system_event_code_idx on public.system_event (code, at desc);
create index system_event_request_idx on public.system_event (request_id);

-- Creates the partitions for this month and the next two; drops the ones older than 2 months.
create function app.maintain_event_partitions() returns void
language plpgsql set search_path = ''
as $$
declare
  month_start date;
  name text;
begin
  for i in 0..2 loop
    month_start := (date_trunc('month', now()) + make_interval(months => i))::date;
    name := 'system_event_' || to_char(month_start, 'YYYYMM');
    if to_regclass('public.' || name) is null then
      execute format(
        'create table public.%I partition of public.system_event for values from (%L) to (%L)',
        name, month_start, (month_start + interval '1 month')::date
      );
      -- Partitions do not inherit RLS; with no policy, direct access to a partition is denied.
      execute format('alter table public.%I enable row level security', name);
    end if;
  end loop;

  for name in
    select c.relname from pg_inherits i
    join pg_class c on c.oid = i.inhrelid
    join pg_class p on p.oid = i.inhparent
    where p.relname = 'system_event' and c.relname ~ '^system_event_[0-9]{6}$'
      and to_date(substring(c.relname from '[0-9]{6}$'), 'YYYYMM') < (date_trunc('month', now()) - interval '2 months')::date
  loop
    execute format('drop table public.%I', name);
  end loop;
end
$$;

-- Catches rows outside the monthly partitions (e.g. clock drift) so no event is lost.
create table public.system_event_default partition of public.system_event default;
alter table public.system_event_default enable row level security;

select app.maintain_event_partitions();

-- ---------------------------------------------------------------------------
-- Metrics (ADR 0022): per minute (kept 7 days) and per hour (kept 1 year)
-- Latency histogram buckets in ms: <=50, <=100, <=250, <=500, <=1000, <=2500, <=5000, >5000.
-- ---------------------------------------------------------------------------

create table public.metric_minute (
  bucket timestamptz not null,
  kind text not null check (kind in ('request', 'job')),
  name text not null check (char_length(name) <= 200),
  count integer not null default 0,
  error_count integer not null default 0,
  total_ms bigint not null default 0,
  max_ms integer not null default 0,
  histogram integer[] not null default array[0, 0, 0, 0, 0, 0, 0, 0],
  primary key (bucket, kind, name)
);

create table public.metric_hour (like public.metric_minute including all);

create function app.latency_bucket(p_ms integer) returns integer
language sql immutable set search_path = ''
as $$
  select case
    when p_ms <= 50 then 1 when p_ms <= 100 then 2 when p_ms <= 250 then 3 when p_ms <= 500 then 4
    when p_ms <= 1000 then 5 when p_ms <= 2500 then 6 when p_ms <= 5000 then 7 else 8
  end
$$;

-- Approximate p95 (upper bound of the bucket that reaches 95% of the requests).
create function app.histogram_p95(p_histogram integer[]) returns integer
language sql immutable set search_path = ''
as $$
  with b as (
    select i, v, sum(v) over (order by i) as running, sum(v) over () as total
    from unnest(p_histogram) with ordinality as t (v, i)
  )
  select (array[50, 100, 250, 500, 1000, 2500, 5000, 10000])[min(i)]
  from b where total > 0 and running >= 0.95 * total
$$;

-- ---------------------------------------------------------------------------
-- Ingestion: one call per batch from the server logger (service_role only)
-- events  = [{ at, code, severity, request_id, route, company_id, user_id, duration_ms, data }]
-- metrics = [{ at, kind, name, duration_ms, error }]
-- ---------------------------------------------------------------------------

create function public.ingest_observability(p_events jsonb, p_metrics jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.system_event (at, code, severity, request_id, route, company_id, user_id, duration_ms, data)
  select coalesce((e ->> 'at')::timestamptz, now()), e ->> 'code', e ->> 'severity', e ->> 'request_id',
         e ->> 'route', (e ->> 'company_id')::uuid, (e ->> 'user_id')::uuid, (e ->> 'duration_ms')::integer,
         coalesce(e -> 'data', '{}')
  from jsonb_array_elements(coalesce(p_events, '[]')) e;

  with x as (
    select date_trunc('minute', coalesce((r ->> 'at')::timestamptz, now())) as bucket,
           r ->> 'kind' as kind, r ->> 'name' as name,
           (r ->> 'duration_ms')::integer as ms,
           coalesce((r ->> 'error')::boolean, false) as err,
           app.latency_bucket((r ->> 'duration_ms')::integer) as b
    from jsonb_array_elements(coalesce(p_metrics, '[]')) r
  )
  insert into public.metric_minute as m (bucket, kind, name, count, error_count, total_ms, max_ms, histogram)
  select bucket, kind, name, count(*), count(*) filter (where err), sum(ms), max(ms),
         array[count(*) filter (where b = 1), count(*) filter (where b = 2), count(*) filter (where b = 3),
               count(*) filter (where b = 4), count(*) filter (where b = 5), count(*) filter (where b = 6),
               count(*) filter (where b = 7), count(*) filter (where b = 8)]::integer[]
  from x
  group by bucket, kind, name
  on conflict (bucket, kind, name) do update
  set count = m.count + excluded.count,
      error_count = m.error_count + excluded.error_count,
      total_ms = m.total_ms + excluded.total_ms,
      max_ms = greatest(m.max_ms, excluded.max_ms),
      histogram = array(select a + b from unnest(m.histogram, excluded.histogram) as t (a, b));
end
$$;

-- Hourly rollup and retention (pg_cron below).
create function app.rollup_metrics() returns void
language sql set search_path = ''
as $$
  insert into public.metric_hour as h (bucket, kind, name, count, error_count, total_ms, max_ms, histogram)
  select date_trunc('hour', bucket), kind, name, sum(count), sum(error_count), sum(total_ms), max(max_ms),
         array[sum(histogram[1]), sum(histogram[2]), sum(histogram[3]), sum(histogram[4]),
               sum(histogram[5]), sum(histogram[6]), sum(histogram[7]), sum(histogram[8])]::integer[]
  from public.metric_minute m
  where bucket >= date_trunc('hour', now()) - interval '2 hours' and bucket < date_trunc('hour', now())
  group by date_trunc('hour', bucket), kind, name
  on conflict (bucket, kind, name) do update
  set count = excluded.count, error_count = excluded.error_count, total_ms = excluded.total_ms,
      max_ms = excluded.max_ms, histogram = excluded.histogram;
$$;

create function app.observability_retention() returns void
language sql set search_path = ''
as $$
  delete from public.system_event where at < now() - interval '30 days';
  delete from public.metric_minute where bucket < now() - interval '7 days';
  delete from public.metric_hour where bucket < now() - interval '1 year';
  select app.maintain_event_partitions();
$$;

-- Super Admin marks critical alerts as seen (alerts live only in the panel, ADR 0022).
create function public.mark_events_seen(p_event_ids uuid[]) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  changed integer;
begin
  perform app.require_platform_admin();
  update public.system_event set seen_at = now() where id = any (p_event_ids) and seen_at is null;
  get diagnostics changed = row_count;
  return changed;
end
$$;

-- ---------------------------------------------------------------------------
-- Access: the Super Admin reads; the server (service_role) runs the queue and ingests
-- ---------------------------------------------------------------------------

alter table public.system_event enable row level security;
alter table public.metric_minute enable row level security;
alter table public.metric_hour enable row level security;

grant select on public.system_event, public.metric_minute, public.metric_hour to authenticated;
create policy platform_admin_read on public.system_event for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.metric_minute for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.metric_hour for select to authenticated using (app.is_platform_admin());

revoke all on all routines in schema app from public;

revoke all on function public.claim_jobs(integer, integer), public.complete_job(uuid), public.fail_job(uuid, text),
  public.ingest_observability(jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.claim_jobs(integer, integer), public.complete_job(uuid), public.fail_job(uuid, text),
  public.ingest_observability(jsonb, jsonb)
to service_role;

revoke all on function public.retry_job(uuid), public.mark_events_seen(uuid[]) from public, anon;
grant execute on function public.retry_job(uuid), public.mark_events_seen(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- Schedules
-- ---------------------------------------------------------------------------

select cron.schedule('observability-rollup', '5 * * * *', $$select app.rollup_metrics();$$);
select cron.schedule('observability-retention', '30 18 * * *', $$select app.observability_retention();$$);
