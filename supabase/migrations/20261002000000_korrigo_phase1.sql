-- KORRIGO phase 1 : Supabase Auth, RLS, storage.
-- L'IA (correction_kind = 'ai') est prévue mais non utilisée.

create extension if not exists unaccent with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists private.internal_secrets (
  name text primary key,
  value text not null
);
revoke all on table private.internal_secrets from public, anon, authenticated;

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(extensions.unaccent(coalesce(value, ''))),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

do $$ begin
  create type public.app_role as enum ('student', 'admin', 'super_admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.study_level as enum ('L1', 'L2', 'L3', 'M1', 'M2');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_plan as enum ('monthly', 'yearly');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_status as enum ('active', 'canceled', 'expired', 'past_due');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_kind as enum ('subscription', 'one_time');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'successful', 'failed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.correction_kind as enum ('manual', 'ai');
exception when duplicate_object then null;
end $$;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (department_id, slug)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (program_id, slug)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'student',
  program_id uuid references public.programs(id) on delete set null,
  level public.study_level,
  objectives text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_scopes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  department_id uuid references public.departments(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  level public.study_level,
  created_at timestamptz not null default now(),
  constraint admin_scope_shape check (
    (department_id is not null and program_id is null and level is null)
    or (department_id is null and program_id is not null and level is not null)
  )
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  level public.study_level not null,
  title text not null,
  slug text not null unique,
  description text,
  year integer not null,
  semester text,
  exam_type text not null,
  is_free boolean not null default false,
  file_path text,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exams_program_level_idx on public.exams (program_id, level);

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null unique references public.exams(id) on delete cascade,
  body text,
  file_path text,
  kind public.correction_kind not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists public.student_exam_schedules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  exam_on date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind public.payment_kind not null,
  plan public.billing_plan,
  program_id uuid references public.programs(id) on delete set null,
  exam_id uuid references public.exams(id) on delete set null,
  amount integer not null,
  currency text not null default 'DZD',
  status public.payment_status not null default 'pending',
  checkout_id text unique,
  operator text,
  provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_target check (
    (kind = 'subscription' and program_id is not null and exam_id is null and plan is not null)
    or (kind = 'one_time' and exam_id is not null and plan is null)
  )
);

create index if not exists payments_profile_status_idx on public.payments (profile_id, status);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  plan public.billing_plan not null,
  status public.billing_status not null default 'active',
  provider text not null,
  provider_reference text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, program_id)
);

create table if not exists public.one_time_purchases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (profile_id, exam_id)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists exams_touch on public.exams;
create trigger exams_touch before update on public.exams
for each row execute function public.touch_updated_at();

drop trigger if exists payments_touch on public.payments;
create trigger payments_touch before update on public.payments
for each row execute function public.touch_updated_at();

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch before update on public.subscriptions
for each row execute function public.touch_updated_at();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.admin_covers(target_program uuid, target_level public.study_level)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin() or exists (
    select 1
    from public.admin_scopes scope
    join public.programs program on program.id = target_program
    where scope.profile_id = auth.uid()
      and (
        scope.department_id = program.department_id
        or (scope.program_id = target_program and scope.level = target_level)
      )
  );
$$;

create or replace function public.can_access_exam(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.exams exam
    where exam.id = target
      and (
        public.admin_covers(exam.program_id, exam.level)
        or (
          auth.uid() is not null
          and (
            exam.is_free
            or exists (
              select 1 from public.one_time_purchases purchase
              where purchase.profile_id = auth.uid() and purchase.exam_id = exam.id
            )
            or exists (
              select 1 from public.subscriptions sub
              where sub.profile_id = auth.uid()
                and sub.program_id = exam.program_id
                and sub.status = 'active'
                and (sub.current_period_end is null or sub.current_period_end > now())
            )
          )
        )
      )
  );
$$;

create or replace function public.secret_matches(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1 from private.internal_secrets
    where name = 'fulfillment' and value = p_secret and p_secret is not null and length(p_secret) > 16
  );
$$;

create or replace function public.read_payment_for_webhook(
  p_secret text,
  p_payment_id uuid default null,
  p_checkout_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  row public.payments;
begin
  if not public.secret_matches(p_secret) then
    raise exception 'forbidden';
  end if;
  select * into row from public.payments
  where (p_payment_id is not null and id = p_payment_id)
     or (p_checkout_id is not null and checkout_id = p_checkout_id)
  limit 1;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'id', row.id,
    'profile_id', row.profile_id,
    'kind', row.kind,
    'plan', row.plan,
    'program_id', row.program_id,
    'exam_id', row.exam_id,
    'amount', row.amount,
    'currency', row.currency,
    'status', row.status,
    'checkout_id', row.checkout_id,
    'operator', row.operator
  );
end;
$$;

create or replace function public.fulfill_payment(
  p_secret text,
  p_payment_id uuid,
  p_status text,
  p_checkout_id text default null,
  p_operator text default null,
  p_provider text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  row public.payments;
  period timestamptz;
begin
  if not public.secret_matches(p_secret) then
    raise exception 'forbidden';
  end if;
  if p_status not in ('successful', 'failed') then
    raise exception 'invalid status';
  end if;

  select * into row from public.payments where id = p_payment_id for update;
  if not found then
    return null;
  end if;
  if row.status = 'successful' then
    return public.read_payment_for_webhook(p_secret, row.id, null);
  end if;

  update public.payments
  set status = p_status::public.payment_status,
      checkout_id = coalesce(p_checkout_id, checkout_id),
      operator = coalesce(p_operator, operator),
      provider = coalesce(p_provider, provider)
  where id = row.id;

  if p_status = 'successful' and row.kind = 'subscription' then
    period := case when row.plan = 'monthly' then now() + interval '1 month' else now() + interval '1 year' end;
    insert into public.subscriptions (profile_id, program_id, plan, status, provider, provider_reference, current_period_end)
    values (row.profile_id, row.program_id, row.plan, 'active', coalesce(p_provider, 'chargily'), coalesce(p_checkout_id, row.checkout_id), period)
    on conflict (profile_id, program_id) do update
      set plan = excluded.plan,
          status = 'active',
          provider = excluded.provider,
          provider_reference = excluded.provider_reference,
          current_period_end = excluded.current_period_end;
  elsif p_status = 'successful' and row.kind = 'one_time' then
    insert into public.one_time_purchases (profile_id, exam_id, payment_id)
    values (row.profile_id, row.exam_id, row.id)
    on conflict (profile_id, exam_id) do nothing;
  end if;

  return public.read_payment_for_webhook(p_secret, row.id, null);
end;
$$;

create or replace function public.attach_checkout(p_payment_id uuid, p_checkout_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.payments
  set checkout_id = p_checkout_id
  where id = p_payment_id
    and profile_id = auth.uid()
    and status = 'pending';
  if not found then
    raise exception 'forbidden';
  end if;
end;
$$;

create or replace function public.register_exam_view(exam_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.exams set views = views + 1 where slug = exam_slug;
$$;

create or replace function public.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    new.role = old.role;
    new.email = old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
for each row execute function public.protect_profile();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned public.app_role := 'student';
begin
  if not exists (select 1 from public.profiles where role = 'super_admin') then
    assigned := 'super_admin';
  end if;
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    assigned
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_scopes enable row level security;
alter table public.exams enable row level security;
alter table public.corrections enable row level security;
alter table public.student_exam_schedules enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.one_time_purchases enable row level security;

drop policy if exists departments_read on public.departments;
create policy departments_read on public.departments for select using (true);
drop policy if exists departments_write on public.departments;
create policy departments_write on public.departments for all
  using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists programs_read on public.programs;
create policy programs_read on public.programs for select using (true);
drop policy if exists programs_write on public.programs;
create policy programs_write on public.programs for all
  using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists courses_read on public.courses;
create policy courses_read on public.courses for select using (true);
drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses for all
  using (
    public.is_super_admin()
    or exists (
      select 1
      from public.programs program
      join public.admin_scopes scope on scope.profile_id = auth.uid()
      where program.id = courses.program_id
        and scope.department_id = program.department_id
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1
      from public.programs program
      join public.admin_scopes scope on scope.profile_id = auth.uid()
      where program.id = program_id
        and scope.department_id = program.department_id
    )
  );

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

drop policy if exists admin_scopes_super on public.admin_scopes;
create policy admin_scopes_super on public.admin_scopes for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists admin_scopes_read_own on public.admin_scopes;
create policy admin_scopes_read_own on public.admin_scopes for select
  using (profile_id = auth.uid());

drop policy if exists exams_read on public.exams;
create policy exams_read on public.exams for select using (true);
drop policy if exists exams_insert on public.exams;
create policy exams_insert on public.exams for insert
  with check (public.admin_covers(program_id, level));
drop policy if exists exams_update on public.exams;
create policy exams_update on public.exams for update
  using (public.admin_covers(program_id, level))
  with check (public.admin_covers(program_id, level));
drop policy if exists exams_delete on public.exams;
create policy exams_delete on public.exams for delete
  using (public.admin_covers(program_id, level));

drop policy if exists corrections_read on public.corrections;
create policy corrections_read on public.corrections for select
  using (public.can_access_exam(exam_id));
drop policy if exists corrections_write on public.corrections;
create policy corrections_write on public.corrections for all
  using (exists (
    select 1 from public.exams exam
    where exam.id = exam_id and public.admin_covers(exam.program_id, exam.level)
  ))
  with check (exists (
    select 1 from public.exams exam
    where exam.id = exam_id and public.admin_covers(exam.program_id, exam.level)
  ));

drop policy if exists schedules_own on public.student_exam_schedules;
create policy schedules_own on public.student_exam_schedules for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select
  using (profile_id = auth.uid() or public.is_super_admin());
drop policy if exists payments_insert on public.payments;
create policy payments_insert on public.payments for insert
  with check (profile_id = auth.uid() and status = 'pending');

drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions for select
  using (profile_id = auth.uid() or public.is_super_admin());

drop policy if exists purchases_select on public.one_time_purchases;
create policy purchases_select on public.one_time_purchases for select
  using (profile_id = auth.uid() or public.is_super_admin());

insert into storage.buckets (id, name, public)
values ('exams', 'exams', false)
on conflict (id) do nothing;

drop policy if exists exam_files_read on storage.objects;
create policy exam_files_read on storage.objects for select
  to authenticated
  using (
    bucket_id = 'exams'
    and public.can_access_exam(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists exam_files_write on storage.objects;
create policy exam_files_write on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'exams'
    and exists (
      select 1 from public.exams exam
      where exam.id = ((storage.foldername(name))[1])::uuid
        and public.admin_covers(exam.program_id, exam.level)
    )
  );

grant usage on schema public to anon, authenticated;
grant select on public.departments, public.programs, public.courses, public.exams to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.admin_scopes to authenticated;
grant insert, update, delete on public.exams to authenticated;
grant select, insert, update, delete on public.corrections to authenticated;
grant select, insert, update, delete on public.student_exam_schedules to authenticated;
grant select, insert on public.payments to authenticated;
grant select on public.subscriptions, public.one_time_purchases to authenticated;
grant execute on function public.slugify(text) to anon, authenticated;
grant execute on function public.can_access_exam(uuid) to anon, authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.admin_covers(uuid, public.study_level) to authenticated;
grant execute on function public.attach_checkout(uuid, text) to authenticated;
grant execute on function public.register_exam_view(text) to anon, authenticated;
grant execute on function public.read_payment_for_webhook(text, uuid, text) to anon, authenticated;
grant execute on function public.fulfill_payment(text, uuid, text, text, text, text) to anon, authenticated;

insert into public.departments (name, slug)
select distinct seed.department, public.slugify(seed.department)
from (values
  ('Faculté des sciences', 'Informatique'),
  ('Faculté des sciences', 'Mathématiques'),
  ('Faculté des sciences', 'Chimie analytique'),
  ('Faculté des sciences', 'Chimie organique'),
  ('Faculté des sciences', 'Physique'),
  ('Faculté des sciences', 'Tronc commun'),
  ('Faculté des sciences de la nature et de la vie', 'Biologie'),
  ('Faculté des sciences de la nature et de la vie', 'Biotechnologie'),
  ('Faculté des sciences de la nature et de la vie', 'Sciences alimentaires'),
  ('Faculté des sciences de la nature et de la vie', 'Tronc commun'),
  ('Faculté de technologie', 'Génie civil'),
  ('Faculté de technologie', 'Génie des procédés'),
  ('Faculté de technologie', 'Génie mécanique'),
  ('Faculté de technologie', 'Sciences de l''eau et de l''environnement'),
  ('Faculté de technologie', 'Électronique'),
  ('Faculté de technologie', 'Énergies renouvelables'),
  ('Faculté de technologie', 'Automatique et électrotechnique'),
  ('Faculté de technologie', 'Tronc commun sciences et technologie (LMD)'),
  ('Faculté de technologie', 'Tronc commun sciences et technologie (ingénieur)'),
  ('Faculté de médecine', 'Médecine'),
  ('Faculté de médecine', 'Pharmacie'),
  ('Faculté de médecine', 'Médecine dentaire'),
  ('Institut des sciences vétérinaires', 'Phase préclinique'),
  ('Institut des sciences vétérinaires', 'Phase clinique'),
  ('Institut des sciences vétérinaires', 'Médecine, chirurgie et reproduction animale'),
  ('Institut des sciences et techniques appliquées', 'Technologie du lait et dérivés'),
  ('Institut des sciences et techniques appliquées', 'Technologie des céréales et dérivés'),
  ('Institut des sciences et techniques appliquées', 'Technologie de l''eau et des boissons'),
  ('Institut des sciences et techniques appliquées', 'Techniques de commercialisation en sciences alimentaires'),
  ('Institut d''architecture et d''urbanisme', 'Architecture'),
  ('Institut d''architecture et d''urbanisme', 'Urbanisme'),
  ('Institut d''architecture et d''urbanisme', 'Patrimoine'),
  ('Institut d''aéronautique et des études spatiales', 'Construction aéronautique'),
  ('Institut d''aéronautique et des études spatiales', 'Navigation aérienne'),
  ('Institut d''aéronautique et des études spatiales', 'Études spatiales'),
  ('Institut d''aéronautique et des études spatiales', 'Tronc commun')
) as seed(department, program)
on conflict (slug) do nothing;

insert into public.programs (department_id, name, slug)
select department.id, seed.program, public.slugify(seed.program)
from (values
  ('Faculté des sciences', 'Informatique'),
  ('Faculté des sciences', 'Mathématiques'),
  ('Faculté des sciences', 'Chimie analytique'),
  ('Faculté des sciences', 'Chimie organique'),
  ('Faculté des sciences', 'Physique'),
  ('Faculté des sciences', 'Tronc commun'),
  ('Faculté des sciences de la nature et de la vie', 'Biologie'),
  ('Faculté des sciences de la nature et de la vie', 'Biotechnologie'),
  ('Faculté des sciences de la nature et de la vie', 'Sciences alimentaires'),
  ('Faculté des sciences de la nature et de la vie', 'Tronc commun'),
  ('Faculté de technologie', 'Génie civil'),
  ('Faculté de technologie', 'Génie des procédés'),
  ('Faculté de technologie', 'Génie mécanique'),
  ('Faculté de technologie', 'Sciences de l''eau et de l''environnement'),
  ('Faculté de technologie', 'Électronique'),
  ('Faculté de technologie', 'Énergies renouvelables'),
  ('Faculté de technologie', 'Automatique et électrotechnique'),
  ('Faculté de technologie', 'Tronc commun sciences et technologie (LMD)'),
  ('Faculté de technologie', 'Tronc commun sciences et technologie (ingénieur)'),
  ('Faculté de médecine', 'Médecine'),
  ('Faculté de médecine', 'Pharmacie'),
  ('Faculté de médecine', 'Médecine dentaire'),
  ('Institut des sciences vétérinaires', 'Phase préclinique'),
  ('Institut des sciences vétérinaires', 'Phase clinique'),
  ('Institut des sciences vétérinaires', 'Médecine, chirurgie et reproduction animale'),
  ('Institut des sciences et techniques appliquées', 'Technologie du lait et dérivés'),
  ('Institut des sciences et techniques appliquées', 'Technologie des céréales et dérivés'),
  ('Institut des sciences et techniques appliquées', 'Technologie de l''eau et des boissons'),
  ('Institut des sciences et techniques appliquées', 'Techniques de commercialisation en sciences alimentaires'),
  ('Institut d''architecture et d''urbanisme', 'Architecture'),
  ('Institut d''architecture et d''urbanisme', 'Urbanisme'),
  ('Institut d''architecture et d''urbanisme', 'Patrimoine'),
  ('Institut d''aéronautique et des études spatiales', 'Construction aéronautique'),
  ('Institut d''aéronautique et des études spatiales', 'Navigation aérienne'),
  ('Institut d''aéronautique et des études spatiales', 'Études spatiales'),
  ('Institut d''aéronautique et des études spatiales', 'Tronc commun')
) as seed(department, program)
join public.departments department on department.name = seed.department
on conflict (department_id, slug) do nothing;

drop table if exists public."Favorite" cascade;
drop table if exists public."Payment" cascade;
drop table if exists public."Subscription" cascade;
drop table if exists public."Subject" cascade;
drop table if exists public."University" cascade;
drop table if exists public."User" cascade;
drop type if exists public."Role";
drop type if exists public."SubscriptionPlan";
drop type if exists public."SubscriptionStatus";
drop type if exists public."PaymentStatus";
