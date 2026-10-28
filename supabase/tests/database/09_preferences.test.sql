-- Preferences of the signed-in person (layer 01).
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select is(
  (select count(*)::int from public.user_profile p join auth.users u on u.id = p.user_id
   where u.email like '%@neo.local' and p.locale is not null),
  0, 'profiles that never chose a language have none saved'
);

select set_config('t.user', tests.create_user('pref-user@neo.test')::text, true);
select tests.authenticate_as(current_setting('t.user')::uuid);

select is(public.my_session() ->> 'locale', null, 'without a profile there is no saved language');

select lives_ok($$ select public.set_my_locale('pt') $$, 'saving the language creates the profile');
select is(
  (select display_name || ':' || locale || ':' || login_kind from public.user_profile
   where user_id = current_setting('t.user')::uuid),
  'pref-user:pt:email', 'the new profile takes the name from the e-mail'
);

select public.set_my_locale('ja');
select is(public.my_session() ->> 'locale', 'ja', 'the session returns the saved language');

select throws_ok($$ select public.set_my_locale('fr') $$, 'P0001', 'validation', 'an unknown language is refused');

select tests.clear_authentication();
set local role anon;
select throws_ok($$ select public.set_my_locale('pt') $$, '42501', null, 'a visitor cannot save a language');

select * from finish();
rollback;
