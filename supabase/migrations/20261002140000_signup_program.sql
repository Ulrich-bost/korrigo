create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned public.app_role := 'student';
  chosen_program uuid;
  chosen_level public.study_level;
begin
  if not exists (select 1 from public.profiles where role = 'super_admin') then
    assigned := 'super_admin';
  end if;

  if assigned = 'student' then
    begin
      chosen_program := nullif(new.raw_user_meta_data->>'program_id', '')::uuid;
    exception when others then
      chosen_program := null;
    end;
    begin
      chosen_level := nullif(new.raw_user_meta_data->>'level', '')::public.study_level;
    exception when others then
      chosen_level := null;
    end;
    if chosen_program is null
      or chosen_level is null
      or not exists (select 1 from public.programs where id = chosen_program) then
      chosen_program := null;
      chosen_level := null;
    end if;
  end if;

  insert into public.profiles (id, email, full_name, role, program_id, level)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    assigned,
    chosen_program,
    chosen_level
  );
  return new;
end;
$$;
