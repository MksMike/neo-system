-- Login (SA-06): 2FA switch (ADR 0024), invitation acceptance and session summary (ADR 0016).

-- ---------------------------------------------------------------------------
-- Platform settings
-- ---------------------------------------------------------------------------

create table public.platform_setting (
  key text primary key check (key ~ '^[a-z_]{2,50}$'),
  value jsonb not null,
  description text not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

call app.add_standard_triggers('public.platform_setting', 'platform', 'key');
alter table public.platform_setting enable row level security;
grant select on public.platform_setting to authenticated;

-- ADR 0024: 2FA off during the MVP; back on at the real-data trigger (ADR 0015) by migration.
insert into public.platform_setting (key, value, description)
values ('require_mfa', 'false', 'Exige 2FA (sessão aal2) para Super Admin, Proprietário e Gestor. ADR 0024.');

-- Missing or unreadable setting means "required": a data error lands on the safe side.
create function app.mfa_required() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select (s.value #>> '{}')::boolean from public.platform_setting s where s.key = 'require_mfa' and s.deleted_at is null),
    true
  )
$$;

create or replace function app.is_platform_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select (not app.mfa_required() or app.current_aal() = 'aal2')
    and exists (
      select 1 from public.platform_admin pa
      where pa.user_id = app.current_user_id() and pa.is_active and pa.deleted_at is null
    )
$$;

create or replace function app.has_role(p_company_id uuid, p_roles text[]) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.membership m
    where m.company_id = p_company_id
      and m.user_id = app.current_user_id()
      and m.status = 'active'
      and m.deleted_at is null
      and (m.valid_until is null or m.valid_until > now())
      and m.role = any (p_roles)
      and (m.role not in ('owner', 'manager') or not app.mfa_required() or app.current_aal() = 'aal2')
  )
$$;

create policy platform_admin_read on public.platform_setting for select to authenticated using (app.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Owner invitation acceptance (ADR 0012, ADR 0016)
-- ---------------------------------------------------------------------------

-- Called by the invited user after setting the password. Only the e-mail that was invited can accept.
create function public.accept_owner_invitation(p_invitation_id uuid) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := app.current_user_id();
  user_email text := lower(auth.jwt() ->> 'email');
  inv public.owner_invitation;
begin
  if v_user_id is null then
    perform app.raise('forbidden', 'not_signed_in');
  end if;

  select * into inv from public.owner_invitation
  where id = p_invitation_id and deleted_at is null
  for update;
  if inv.id is null then
    perform app.raise('not_found', 'invitation_not_found');
  end if;
  if inv.email <> user_email then
    perform app.raise('forbidden', 'invitation_email_mismatch');
  end if;
  if inv.status = 'accepted' then
    perform app.raise('conflict', 'invitation_already_accepted');
  end if;
  if not exists (select 1 from public.company c where c.id = inv.company_id and c.deleted_at is null and c.status <> 'canceled') then
    perform app.raise('conflict', 'company_not_available');
  end if;

  insert into public.user_profile (user_id, display_name, login_kind, created_by)
  values (v_user_id, inv.name, 'email', v_user_id)
  on conflict on constraint user_profile_user_id_key do nothing;

  insert into public.membership (user_id, company_id, role, created_by)
  select v_user_id, inv.company_id, 'owner', v_user_id
  where not exists (
    select 1 from public.membership m where m.user_id = v_user_id and m.company_id = inv.company_id and m.deleted_at is null
  );

  update public.owner_invitation set status = 'accepted', accepted_at = now() where id = inv.id;
  perform app.log_platform_action('owner_invitation.accepted', inv.company_id, jsonb_build_object('invitation_id', inv.id));
  return inv.company_id;
end
$$;

-- ---------------------------------------------------------------------------
-- Session summary: where the signed-in person can go after login
-- ---------------------------------------------------------------------------

create function public.my_session() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'user_id', app.current_user_id(),
    'is_platform_admin', app.is_platform_admin(),
    'memberships', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'company_id', c.id, 'code', c.code, 'display_name', c.display_name, 'status', c.status, 'role', m.role
      ) order by c.display_name), '[]')
      from public.membership m
      join public.company c on c.id = m.company_id and c.deleted_at is null
      where m.user_id = app.current_user_id()
        and m.status = 'active' and m.deleted_at is null
        and (m.valid_until is null or m.valid_until > now())
    )
  )
$$;

revoke all on all routines in schema app from public;
grant execute on function app.current_user_id(), app.current_aal(), app.today(),
  app.is_platform_admin(), app.has_role(uuid, text[]), app.is_member(uuid)
  to authenticated, service_role;

revoke all on function public.accept_owner_invitation(uuid), public.my_session() from public, anon;
grant execute on function public.accept_owner_invitation(uuid), public.my_session() to authenticated;
