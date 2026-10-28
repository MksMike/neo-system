-- Daily job at 03:00 Asia/Tokyo (18:00 UTC): generate the SaaS charges, then recompute
-- every company status (R00-14, R00-15). ADR 0014: SQL-only jobs run on pg_cron.

create extension if not exists pg_cron;

select cron.schedule(
  'platform-daily',
  '0 18 * * *',
  $$select app.generate_all(app.today()); select app.recompute_all(app.today());$$
);
