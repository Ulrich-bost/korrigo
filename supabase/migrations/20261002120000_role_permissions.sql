-- Périmètres : un admin couvre un département, ou un département et un niveau.
-- La filière et le niveau du profil sont réservés à l'étudiant.

alter table public.admin_scopes drop constraint if exists admin_scope_shape;

update public.admin_scopes scope
set department_id = program.department_id,
    program_id = null
from public.programs program
where scope.department_id is null
  and scope.program_id = program.id;

update public.admin_scopes
set program_id = null
where program_id is not null;

alter table public.admin_scopes
  add constraint admin_scope_shape check (
    department_id is not null
    and program_id is null
  );

update public.profiles
set program_id = null,
    level = null,
    objectives = null
where role in ('admin', 'super_admin');

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
      and scope.department_id = program.department_id
      and (scope.level is null or scope.level = target_level)
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
      and scope.department_id = program.department_id
      and (scope.level is null or scope.level = student.level)
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
          exists (
            select 1
            from public.profiles profile
            where profile.id = auth.uid()
              and profile.role = 'student'
              and profile.program_id = exam.program_id
              and profile.level = exam.level
          )
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

drop policy if exists exams_read on public.exams;
create policy exams_read on public.exams for select
  using (
    public.is_super_admin()
    or public.admin_covers(program_id, level)
    or exists (
      select 1
      from public.profiles profile
      where profile.id = auth.uid()
        and profile.role = 'student'
        and profile.program_id = exams.program_id
        and profile.level = exams.level
    )
  );

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (
    id = auth.uid()
    or public.is_super_admin()
    or public.manages_student(id)
  );

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select
  using (
    profile_id = auth.uid()
    or public.is_super_admin()
    or public.manages_student(profile_id)
  );

drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions for select
  using (
    profile_id = auth.uid()
    or public.is_super_admin()
    or public.manages_student(profile_id)
  );

drop policy if exists purchases_select on public.one_time_purchases;
create policy purchases_select on public.one_time_purchases for select
  using (
    profile_id = auth.uid()
    or public.is_super_admin()
    or public.manages_student(profile_id)
  );

drop policy if exists schedules_own on public.student_exam_schedules;
drop policy if exists schedules_select on public.student_exam_schedules;
drop policy if exists schedules_write on public.student_exam_schedules;
create policy schedules_select on public.student_exam_schedules for select
  using (profile_id = auth.uid() or public.manages_student(profile_id));
create policy schedules_write on public.student_exam_schedules for insert
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'student'
    )
  );
create policy schedules_update on public.student_exam_schedules for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
create policy schedules_delete on public.student_exam_schedules for delete
  using (profile_id = auth.uid());

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
        and scope.level is null
    )
  );

grant execute on function public.manages_student(uuid) to authenticated;
