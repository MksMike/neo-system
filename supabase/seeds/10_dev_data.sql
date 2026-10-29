-- Local development data (SA-06). Seeds run only locally and in CI, never in production.
-- Fictitious data only (ADR 0015). Passwords are for the local database only.
--
--   Super Admin            admin@neo.local        / neo-local-2026
--   Proprietário SUGITA    dono.sugita@neo.local  / neo-local-2026
--   Proprietário DEMO      dono.demo@neo.local    / neo-local-2026

-- A user that can sign in with e-mail and password through Supabase Auth.
create or replace function tests.create_login(p_email text, p_password text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  user_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), user_id, user_id::text, 'email',
    jsonb_build_object('sub', user_id::text, 'email', p_email, 'email_verified', true),
    now(), now(), now()
  );
  return user_id;
end
$$;

do $$
declare
  admin_id uuid := tests.create_login('admin@neo.local', 'neo-local-2026');
  sugita_owner uuid := tests.create_login('dono.sugita@neo.local', 'neo-local-2026');
  demo_owner uuid := tests.create_login('dono.demo@neo.local', 'neo-local-2026');
  next_month date := (date_trunc('month', app.today()) + interval '1 month')::date;
  sugita_id uuid;
  demo_id uuid;
  sugita_invitation uuid;
  demo_invitation uuid;
begin
  insert into public.platform_admin (user_id, name, created_by) values (admin_id, 'Mike (local)', admin_id);

  perform tests.authenticate_as(admin_id);
  sugita_id := public.provision_company(jsonb_build_object(
    'company', jsonb_build_object(
      'code', 'SUGITA', 'legal_name', '株式会社杉田工業', 'legal_name_kana', 'カブシキガイシャスギタコウギョウ',
      'display_name', '杉田工業', 'postal_code', '2900001', 'phone', '0436000000'),
    'contract', jsonb_build_object('type', 'partner'),
    'modules', jsonb_build_array('employees', 'organizations', 'scheduling', 'attendance'),
    'owner', jsonb_build_object('name', 'Dono Sugita', 'email', 'dono.sugita@neo.local')
  ));
  demo_id := public.provision_company(jsonb_build_object(
    'company', jsonb_build_object('code', 'DEMO', 'legal_name', 'デモ株式会社', 'display_name', 'デモ'),
    -- starts on the 1st of next month: billing days must be 1–28 (R00-14)
    'contract', jsonb_build_object('type', 'monthly', 'price_yen', 55000, 'payment_method', 'transfer', 'starts_on', next_month),
    'modules', jsonb_build_array('employees', 'organizations', 'scheduling', 'attendance'),
    'owner', jsonb_build_object('name', 'Dono Demo', 'email', 'dono.demo@neo.local')
  ));

  -- Owners accept their invitations (the e-mails were never sent: jobs marked done).
  -- Look the ids up as postgres: owners cannot read owner_invitation (RLS).
  perform tests.clear_authentication();
  select id into sugita_invitation from public.owner_invitation where company_id = sugita_id;
  select id into demo_invitation from public.owner_invitation where company_id = demo_id;
  perform tests.authenticate_as(sugita_owner, 'aal1');
  perform public.accept_owner_invitation(sugita_invitation);
  perform tests.authenticate_as(demo_owner, 'aal1');
  perform public.accept_owner_invitation(demo_invitation);
  perform tests.clear_authentication();

  update public.job set status = 'done', done_at = now() where type = 'owner_invitation.send';

  -- The investor flag only changes by migration in production (R00-13); here, by seed.
  update public.company set is_investor = true where id = sugita_id;
end
$$;
