-- Base: private schema, default privileges, helpers, row metadata and audit.
-- ADRs 0016, 0020 and 0023; CLAUDE.md rules 1, 5 and 13.

-- Private schema for helpers and logs. Not exposed by the Data API.
create schema if not exists app;
revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

-- Nothing is exposed by default: every grant below and in later migrations is explicit (ADR 0023).
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema app revoke execute on functions from public;
-- Per-schema defaults cannot remove the global PostgreSQL default (EXECUTE to PUBLIC), so revoke it globally too.
alter default privileges revoke execute on routines from public;

-- ---------------------------------------------------------------------------
-- Session helpers. Wrapping auth.* keeps the login provider in one place (ADR 0016).
-- ---------------------------------------------------------------------------

create function app.current_user_id() returns uuid
language sql stable set search_path = ''
as $$ select auth.uid() $$;

-- Assurance level of the session: 'aal2' after the second factor (TOTP).
create function app.current_aal() returns text
language sql stable set search_path = ''
as $$ select coalesce(auth.jwt() ->> 'aal', 'aal1') $$;

-- Business dates are Asia/Tokyo (CLAUDE.md, rule 7).
-- Tests may simulate another day with `set app.today_override = 'YYYY-MM-DD'`, honored only when the
-- session itself belongs to postgres (test runner, migrations). App users connect as `authenticator`
-- and can never move the date.
create function app.today() returns date
language sql stable set search_path = ''
as $$
  select case
    when session_user = 'postgres' and nullif(current_setting('app.today_override', true), '') is not null
      then current_setting('app.today_override', true)::date
    else (now() at time zone 'Asia/Tokyo')::date
  end
$$;

-- Raises an error whose message is a stable code (ADR 0020): validation, conflict,
-- not_found, forbidden, company_read_only, module_disabled. The detail explains it.
create function app.raise(code text, detail text default null) returns void
language plpgsql stable set search_path = ''
as $$
begin
  raise exception using errcode = 'P0001', message = code, detail = coalesce(detail, code);
end
$$;

grant execute on function app.current_user_id(), app.current_aal(), app.today() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row metadata: created/updated stamps and the optimistic-concurrency version (ADR 0020).
-- ---------------------------------------------------------------------------

create function app.set_row_meta() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := coalesce(new.created_by, app.current_user_id());
    new.updated_at := new.created_at;
    new.updated_by := new.created_by;
    new.version := 1;
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
    new.updated_at := now();
    new.updated_by := app.current_user_id();
    new.version := old.version + 1;
  end if;
  return new;
end
$$;

-- ---------------------------------------------------------------------------
-- Audit log: every change to every business table, with before and after (CLAUDE.md, rule 5).
-- ---------------------------------------------------------------------------

create table app.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid,
  scope text not null check (scope in ('platform', 'company')),
  table_name text not null,
  record_id text not null,
  company_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  old_row jsonb,
  new_row jsonb
);

create index audit_log_table_record_idx on app.audit_log (table_name, record_id);
create index audit_log_company_idx on app.audit_log (company_id, at desc);

create function app.audit_row() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  new_row jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  old_row jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  row_data jsonb := coalesce(new_row, old_row);
  key_column text := coalesce(tg_argv[1], 'id');
begin
  insert into app.audit_log (actor_id, scope, table_name, record_id, company_id, action, old_row, new_row)
  values (
    app.current_user_id(),
    tg_argv[0],
    tg_table_name,
    row_data ->> key_column,
    case when tg_table_name = 'company' then (row_data ->> 'id')::uuid else (row_data ->> 'company_id')::uuid end,
    lower(tg_op),
    old_row,
    new_row
  );
  return null;
end
$$;

-- Attaches the metadata and audit triggers to a table.
create procedure app.add_standard_triggers(target regclass, scope text, key_column text default 'id')
language plpgsql set search_path = ''
as $$
begin
  execute format(
    'create trigger set_row_meta before insert or update on %s for each row execute function app.set_row_meta()',
    target
  );
  execute format(
    'create trigger audit_row after insert or update or delete on %s for each row execute function app.audit_row(%L, %L)',
    target, scope, key_column
  );
end
$$;
