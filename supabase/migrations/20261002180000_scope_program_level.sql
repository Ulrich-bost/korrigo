-- Périmètre admin : tout un département, ou une filière et un seul niveau.
-- Le profil staff n'a pas de filière ni de niveau. Le périmètre vit dans admin_scopes.

alter table public.admin_scopes drop constraint if exists admin_scope_shape;

alter table public.admin_scopes
  add constraint admin_scope_shape check (
    (
      department_id is not null
      and program_id is null
      and level is null
    )
    or (
      program_id is not null
      and level is not null
    )
  );

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
        (
          scope.program_id is null
          and scope.level is null
          and scope.department_id = program.department_id
        )
        or (
          scope.program_id = target_program
          and scope.level = target_level
        )
      )
  );
$$;

create or replace function public.manages_student(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin() or exists (
    select 1
    from public.profiles student
    join public.programs program on program.id = student.program_id
    join public.admin_scopes scope on scope.profile_id = auth.uid()
    where student.id = target
      and student.role = 'student'
      and (
        (
          scope.program_id is null
          and scope.level is null
          and scope.department_id = program.department_id
        )
        or (
          scope.program_id = student.program_id
          and scope.level = student.level
        )
      )
  );
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
  if new.role in ('admin', 'super_admin') then
    new.program_id = null;
    new.level = null;
    new.objectives = null;
  end if;
  return new;
end;
$$;

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
        and scope.program_id is null
        and scope.level is null
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
        and scope.program_id is null
        and scope.level is null
    )
  );

grant insert, update, delete on public.admin_scopes to authenticated;

create or replace function public.save_account(
  p_id uuid,
  p_email text,
  p_password text,
  p_name text,
  p_role public.app_role,
  p_program uuid,
  p_level public.study_level,
  p_scopes jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  new_id uuid;
  scope jsonb;
  scope_program uuid;
  scope_level public.study_level;
  scope_department uuid;
  protected boolean;
begin
  if not public.is_super_admin() then
    raise exception 'denied';
  end if;
  if p_role not in ('student', 'admin', 'super_admin') then
    raise exception 'invalid';
  end if;
  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'invalid';
  end if;
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'invalid';
  end if;

  if p_id is not null then
    select email in (
      'superadmin@univ-sujets.fr',
      'admin@univ-sujets.fr',
      'etudiant@univ-sujets.fr'
    ) into protected
    from public.profiles
    where id = p_id;
    if protected then
      raise exception 'denied';
    end if;
  end if;

  if p_role = 'student' then
    if p_program is null or p_level is null then
      raise exception 'invalid';
    end if;
    if not exists (select 1 from public.programs where id = p_program) then
      raise exception 'invalid';
    end if;
  elsif p_role = 'admin' then
    if p_scopes is null or jsonb_typeof(p_scopes) <> 'array' or jsonb_array_length(p_scopes) < 1 then
      raise exception 'invalid';
    end if;
  end if;

  if p_id is null then
    if p_password is null or length(p_password) < 8 then
      raise exception 'invalid';
    end if;
    if exists (select 1 from auth.users where lower(email) = lower(p_email)) then
      raise exception 'exists';
    end if;
    new_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_id,
      'authenticated',
      'authenticated',
      lower(trim(p_email)),
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', trim(p_name),
        'program_id', case when p_role = 'student' then p_program::text else null end,
        'level', case when p_role = 'student' then p_level::text else null end
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      new_id,
      jsonb_build_object('sub', new_id::text, 'email', lower(trim(p_email))),
      'email',
      new_id::text,
      now(),
      now(),
      now()
    );
  else
    new_id := p_id;
    if not exists (select 1 from public.profiles where id = new_id) then
      raise exception 'invalid';
    end if;
    if p_password is not null and length(p_password) > 0 and length(p_password) < 8 then
      raise exception 'invalid';
    end if;
    if p_password is not null and length(p_password) >= 8 then
      update auth.users
      set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
          updated_at = now()
      where id = new_id;
    end if;
  end if;

  update public.profiles
  set full_name = trim(p_name),
      role = p_role,
      program_id = case when p_role = 'student' then p_program else null end,
      level = case when p_role = 'student' then p_level else null end,
      objectives = case when p_role = 'student' then objectives else null end
  where id = new_id;

  delete from public.admin_scopes where profile_id = new_id;

  if p_role = 'admin' then
    for scope in select * from jsonb_array_elements(p_scopes)
    loop
      if scope->>'kind' = 'department' then
        scope_department := nullif(scope->>'departmentId', '')::uuid;
        if scope_department is null or not exists (select 1 from public.departments where id = scope_department) then
          raise exception 'invalid';
        end if;
        insert into public.admin_scopes (profile_id, department_id, program_id, level)
        values (new_id, scope_department, null, null);
      elsif scope->>'kind' = 'program' then
        scope_program := nullif(scope->>'programId', '')::uuid;
        scope_level := nullif(scope->>'level', '')::public.study_level;
        if scope_program is null or scope_level is null
          or not exists (select 1 from public.programs where id = scope_program) then
          raise exception 'invalid';
        end if;
        insert into public.admin_scopes (profile_id, department_id, program_id, level)
        values (new_id, null, scope_program, scope_level);
      else
        raise exception 'invalid';
      end if;
    end loop;
  end if;

  return new_id;
end;
$$;

create or replace function public.remove_account(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_email text;
  target_role public.app_role;
begin
  if not public.is_super_admin() then
    raise exception 'denied';
  end if;
  if p_id = auth.uid() then
    raise exception 'denied';
  end if;
  select email, role into target_email, target_role from public.profiles where id = p_id;
  if target_email is null then
    raise exception 'invalid';
  end if;
  if target_email in (
    'superadmin@univ-sujets.fr',
    'admin@univ-sujets.fr',
    'etudiant@univ-sujets.fr'
  ) then
    raise exception 'denied';
  end if;
  if target_role = 'super_admin' and (
    select count(*) from public.profiles where role = 'super_admin'
  ) <= 1 then
    raise exception 'denied';
  end if;
  delete from auth.users where id = p_id;
end;
$$;

grant execute on function public.save_account(uuid, text, text, text, public.app_role, uuid, public.study_level, jsonb) to authenticated;
grant execute on function public.remove_account(uuid) to authenticated;
