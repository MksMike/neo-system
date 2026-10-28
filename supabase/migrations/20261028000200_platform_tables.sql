-- Platform tables (layer 00) and identity base (layer 01).
-- ADRs 0012, 0014, 0016, 0018 and 0023; rules R00-01 to R00-20.
-- Direct writes are never granted: every change goes through the functions of the next migration.

-- ---------------------------------------------------------------------------
-- Who is Super Admin
-- ---------------------------------------------------------------------------

create table public.platform_admin (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id),
  name text not null check (char_length(name) between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

-- ---------------------------------------------------------------------------
-- Companies (tenants)
-- ---------------------------------------------------------------------------

create table public.company (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{3,12}$'), -- R00-01
  legal_name text not null check (char_length(legal_name) between 1 and 200),
  legal_name_kana text check (char_length(legal_name_kana) <= 200),
  display_name text not null check (char_length(display_name) between 1 and 100),
  invoice_reg_no text check (invoice_reg_no ~ '^T[0-9]{13}$'),
  postal_code text check (postal_code ~ '^[0-9]{7}$'),
  address text check (char_length(address) <= 300),
  phone text check (phone ~ '^0[0-9]{9,10}$'),
  email text check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  status text not null default 'active'
    check (status in ('trial', 'active', 'past_due', 'read_only', 'blocked', 'canceled')),
  status_locked boolean not null default false, -- manual suspension in force (R00-08)
  status_reason text check (char_length(status_reason) <= 500),
  is_investor boolean not null default false, -- only changes by migration (R00-13)
  referred_by_company_id uuid references public.company (id),
  canceled_on date,
  timezone text not null default 'Asia/Tokyo',
  default_locale text not null default 'ja' check (default_locale in ('ja', 'pt', 'es', 'en')),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

-- ---------------------------------------------------------------------------
-- Module catalog and plan templates
-- ---------------------------------------------------------------------------

create table public.module (
  key text primary key check (key ~ '^[a-z_]{2,30}$'),
  name_ja text not null,
  name_pt text not null,
  kind text not null check (kind in ('base', 'optional', 'addon')),
  depends_on text[] not null default '{}', -- all of these (R00-04)
  depends_any text[] not null default '{}', -- at least one of these
  sort_order integer not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

create table public.plan_template (
  key text primary key check (key ~ '^[a-z_]{2,30}$'),
  name_ja text not null,
  name_pt text not null,
  module_keys text[] not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

-- One row per period in which an optional module is on (R00-05). Base modules are always on.
create table public.company_module (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  module_key text not null references public.module (key),
  valid_from date not null,
  valid_to date,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check (valid_to is null or valid_to >= valid_from)
);

create unique index company_module_open_key on public.company_module (company_id, module_key)
  where valid_to is null and deleted_at is null;

-- ---------------------------------------------------------------------------
-- Contracts: one row per version (R00-05, R00-12)
-- ---------------------------------------------------------------------------

create table public.contract (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  type text not null check (type in ('monthly', 'annual', 'partner')),
  price_yen bigint not null default 0 check (price_yen >= 0),
  payment_method text check (payment_method in ('transfer', 'cash')), -- R00-18
  starts_on date not null,
  trial_ends_on date, -- R00-17
  billing_start date, -- first paid period, after the trial (R00-14)
  paid_until date, -- R00-07
  grace_days integer not null default 7 check (grace_days between 0 and 60), -- R00-15
  block_after_days integer not null default 15 check (block_after_days between 0 and 120),
  valid_from date not null,
  valid_to date,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check (valid_to is null or valid_to >= valid_from - 1),
  check (trial_ends_on is null or trial_ends_on >= starts_on),
  check (
    (type = 'partner' and price_yen = 0 and payment_method is null
      and trial_ends_on is null and billing_start is null and paid_until is null)
    or (type <> 'partner' and price_yen > 0 and payment_method is not null
      and billing_start is not null and extract(day from billing_start) <= 28)
  )
);

create unique index contract_current_key on public.contract (company_id)
  where valid_to is null and deleted_at is null;

-- ---------------------------------------------------------------------------
-- SaaS charges and payments (R00-14, R00-16)
-- ---------------------------------------------------------------------------

create table public.saas_charge (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  contract_id uuid not null references public.contract (id),
  period_start date not null,
  period_end date not null,
  due_on date not null,
  amount_yen bigint not null check (amount_yen > 0),
  paid_yen bigint not null default 0 check (paid_yen >= 0),
  fee_yen bigint not null default 0 check (fee_yen >= 0), -- difference settled as 振込手数料
  status text not null default 'open' check (status in ('open', 'partial', 'paid', 'canceled')),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  unique (company_id, period_start),
  check (period_end >= period_start),
  check (paid_yen + fee_yen <= amount_yen)
);

create table public.saas_payment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  charge_id uuid not null references public.saas_charge (id),
  paid_on date not null,
  amount_yen bigint not null check (amount_yen > 0),
  method text not null check (method in ('transfer', 'cash')),
  reference text check (char_length(reference) <= 100),
  receipt_path text check (char_length(receipt_path) <= 300),
  settlement text not null check (settlement in ('full', 'settle_with_fee', 'leave_open')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

-- ---------------------------------------------------------------------------
-- History: status changes and Super Admin actions (append only, never updated)
-- ---------------------------------------------------------------------------

create table public.company_status_event (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  from_status text,
  to_status text not null,
  reason text check (char_length(reason) <= 500),
  source text not null check (source in ('auto', 'manual')),
  actor_id uuid,
  created_at timestamptz not null default now()
);

create index company_status_event_company_idx on public.company_status_event (company_id, created_at desc);

create table public.platform_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  company_id uuid references public.company (id),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index platform_audit_log_company_idx on public.platform_audit_log (company_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Identity base (layer 01, ADR 0016)
-- ---------------------------------------------------------------------------

create table public.user_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id),
  display_name text not null check (char_length(display_name) between 1 and 100),
  locale text not null default 'ja' check (locale in ('ja', 'pt', 'es', 'en')),
  login_kind text not null check (login_kind in ('email', 'pin')),
  employee_login_id text unique check (employee_login_id ~ '^[0-9]{8}$'),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1,
  check ((login_kind = 'pin') = (employee_login_id is not null))
);

create table public.membership (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  company_id uuid not null references public.company (id),
  role text not null check (role in ('owner', 'manager', 'coordinator', 'employee')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  valid_until timestamptz, -- temporary support access (R00-10)
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

create unique index membership_user_company_key on public.membership (user_id, company_id)
  where deleted_at is null;
create index membership_company_idx on public.membership (company_id);

-- Owner invitation: created in the provisioning transaction, sent by the job queue (ADR 0012).
create table public.owner_invitation (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company (id),
  email text not null check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  name text not null check (char_length(name) between 1 and 100),
  status text not null default 'pending' check (status in ('pending', 'sent', 'accepted', 'failed')),
  job_id uuid,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

-- ---------------------------------------------------------------------------
-- Job queue (ADR 0014). Claimed with FOR UPDATE SKIP LOCKED by /api/jobs/run (SA-05).
-- ---------------------------------------------------------------------------

create table public.job (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.company (id),
  type text not null check (type ~ '^[a-z_]+(\.[a-z_]+)+$'),
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  attempts integer not null default 0,
  max_attempts integer not null default 5 check (max_attempts between 1 and 20),
  run_after timestamptz not null default now(),
  locked_until timestamptz,
  last_error text,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer not null default 1
);

create index job_pending_idx on public.job (run_after) where status = 'pending';

-- ---------------------------------------------------------------------------
-- Triggers: metadata + audit on every table with metadata columns
-- ---------------------------------------------------------------------------

call app.add_standard_triggers('public.platform_admin', 'platform');
call app.add_standard_triggers('public.company', 'platform');
call app.add_standard_triggers('public.module', 'platform', 'key');
call app.add_standard_triggers('public.plan_template', 'platform', 'key');
call app.add_standard_triggers('public.company_module', 'platform');
call app.add_standard_triggers('public.contract', 'platform');
call app.add_standard_triggers('public.saas_charge', 'platform');
call app.add_standard_triggers('public.saas_payment', 'platform');
call app.add_standard_triggers('public.user_profile', 'platform');
call app.add_standard_triggers('public.membership', 'platform');
call app.add_standard_triggers('public.owner_invitation', 'platform');
call app.add_standard_triggers('public.job', 'platform');

-- ---------------------------------------------------------------------------
-- Access helpers used by the policies (ADR 0016)
-- ---------------------------------------------------------------------------

-- Super Admin with the second factor. Security definer: platform_admin is not readable directly.
create function app.is_platform_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select app.current_aal() = 'aal2'
    and exists (
      select 1 from public.platform_admin pa
      where pa.user_id = app.current_user_id() and pa.is_active and pa.deleted_at is null
    )
$$;

-- Active membership with one of the roles. Owner and manager also need the second factor.
create function app.has_role(p_company_id uuid, p_roles text[]) returns boolean
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
      and (m.role not in ('owner', 'manager') or app.current_aal() = 'aal2')
  )
$$;

create function app.is_member(p_company_id uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select app.has_role(p_company_id, array['owner', 'manager', 'coordinator', 'employee']) $$;

grant execute on function app.is_platform_admin(), app.has_role(uuid, text[]), app.is_member(uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row level security. Reads only; no table grants INSERT, UPDATE or DELETE (ADR 0023).
-- ---------------------------------------------------------------------------

alter table public.platform_admin enable row level security;
alter table public.company enable row level security;
alter table public.module enable row level security;
alter table public.plan_template enable row level security;
alter table public.company_module enable row level security;
alter table public.contract enable row level security;
alter table public.saas_charge enable row level security;
alter table public.saas_payment enable row level security;
alter table public.company_status_event enable row level security;
alter table public.platform_audit_log enable row level security;
alter table public.user_profile enable row level security;
alter table public.membership enable row level security;
alter table public.owner_invitation enable row level security;
alter table public.job enable row level security;

grant select on
  public.platform_admin, public.company, public.module, public.plan_template, public.company_module,
  public.contract, public.saas_charge, public.saas_payment, public.company_status_event,
  public.platform_audit_log, public.user_profile, public.membership, public.owner_invitation, public.job
to authenticated;

-- Platform data: Super Admin only. Companies read their own status through my_company_access().
create policy platform_admin_read on public.platform_admin for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.company for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.company_module for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.contract for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.saas_charge for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.saas_payment for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.company_status_event for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.platform_audit_log for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.owner_invitation for select to authenticated using (app.is_platform_admin());
create policy platform_admin_read on public.job for select to authenticated using (app.is_platform_admin());

-- Catalogs: any signed-in user (no business data).
create policy catalog_read on public.module for select to authenticated using (deleted_at is null);
create policy catalog_read on public.plan_template for select to authenticated using (deleted_at is null);

-- Profiles: your own; the Super Admin sees all (Users tab).
create policy own_or_admin_read on public.user_profile for select to authenticated
  using (user_id = app.current_user_id() or app.is_platform_admin());

-- Memberships: your own; owner and manager of the company; the Super Admin.
create policy own_company_or_admin_read on public.membership for select to authenticated
  using (
    user_id = app.current_user_id()
    or app.has_role(company_id, array['owner', 'manager'])
    or app.is_platform_admin()
  );

-- ---------------------------------------------------------------------------
-- Reference data: module catalog (layer 00, section 3) and plan templates
-- ---------------------------------------------------------------------------

insert into public.module (key, name_ja, name_pt, kind, depends_on, depends_any, sort_order) values
  ('platform', 'プラットフォーム・ログイン・権限', 'Plataforma, login e permissões', 'base', '{}', '{}', 10),
  ('settings', '会社設定', 'Configurações da empresa', 'base', '{}', '{}', 20),
  ('organizations', '取引先・元請・現場', 'Clientes, subs e locais', 'optional', '{}', '{}', 30),
  ('employees', '従業員', 'Funcionários', 'optional', '{}', '{}', 40),
  ('scheduling', '配置・カレンダー', 'Escalação e calendário', 'optional', '{organizations,employees}', '{}', 50),
  ('attendance', '勤怠確認', 'Apontamento e confirmação diária', 'optional', '{scheduling}', '{}', 60),
  ('documents', '書類・PDF・ライブラリ', 'Documentos, PDFs e biblioteca', 'optional', '{}', '{}', 70),
  ('billing', '締め・請求書', 'Fechamento e 請求書', 'optional', '{attendance,documents}', '{}', 80),
  ('payroll', '給与・支払・前払', 'Folha, pagamentos e vales', 'optional', '{attendance,documents}', '{}', 90),
  ('finance', '財務・現金・経費', 'Financeiro, caixa e despesas', 'optional', '{}', '{billing,payroll}', 100),
  ('messaging', '連絡・メール・アラート', 'Comunicação, e-mail e alertas', 'optional', '{}', '{}', 110),
  ('internal', '社内管理（タスク・日報）', 'Gestão interna (tarefas, 日報)', 'optional', '{employees,messaging}', '{}', 120),
  ('learning', '現場日本語', 'Aprendizado (japonês de genba)', 'optional', '{employees}', '{}', 130),
  ('reports', 'ダッシュボード・レポート', 'Dashboard e relatórios', 'optional', '{}', '{}', 140),
  ('ai', 'AIアシスタント', 'Assistente de IA', 'addon', '{}', '{}', 150),
  ('bank_sync', '銀行明細の自動取込', 'Extrato bancário automático', 'addon', '{finance}', '{}', 160);

insert into public.plan_template (key, name_ja, name_pt, module_keys, sort_order) values
  ('basic', 'ベーシック', 'Básico', '{organizations,employees,scheduling,attendance}', 10),
  ('standard', 'スタンダード', 'Padrão',
    '{organizations,employees,scheduling,attendance,documents,billing,payroll,messaging,reports}', 20),
  ('complete', 'コンプリート', 'Completo',
    '{organizations,employees,scheduling,attendance,documents,billing,payroll,finance,messaging,internal,learning,reports}', 30);
