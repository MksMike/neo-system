-- Preferences of the signed-in person (layer 01): the interface language follows the person,
-- not the browser. After login the app opens in the language saved here.

-- Empty = the person never chose; the browser language applies. The old default ('ja') made
-- every profile look like a choice; nobody could choose before this migration, so all reset.
alter table public.user_profile alter column locale drop default;
alter table public.user_profile alter column locale drop not null;
update public.user_profile set locale = null;

-- Saves the language. Creates the profile of an e-mail login that has none yet (dev seed,
-- Super Admin); an existing profile only changes its language.
create function public.set_my_locale(p_locale text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := app.current_user_id();
begin
  if uid is null then
    perform app.raise('forbidden', 'not_signed_in');
  end if;
  if p_locale is null or p_locale not in ('ja', 'pt', 'es', 'en') then
    perform app.raise('validation', 'locale_invalid');
  end if;

  insert into public.user_profile (user_id, display_name, login_kind, locale, created_by)
  select u.id,
         left(coalesce(nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''), split_part(u.email, '@', 1)), 100),
         'email', p_locale, uid
  from auth.users u
  where u.id = uid
  on conflict on constraint user_profile_user_id_key
  do update set locale = excluded.locale, updated_by = uid;
end
$$;

-- Session summary: adds the person's name and language.
create or replace function public.my_session() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'user_id', app.current_user_id(),
    'is_platform_admin', app.is_platform_admin(),
    'display_name', (select p.display_name from public.user_profile p
                     where p.user_id = app.current_user_id() and p.deleted_at is null),
    'locale', (select p.locale from public.user_profile p
               where p.user_id = app.current_user_id() and p.deleted_at is null),
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

revoke execute on function public.set_my_locale(text) from public, anon;
grant execute on function public.set_my_locale(text) to authenticated;
