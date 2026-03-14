-- Promote existing auth user to admin profile
-- Target email: adminkreya@yopmail.com

do $$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where email = 'adminkreya@yopmail.com'
  limit 1;

  if target_user_id is null then
    raise notice 'No auth user found for adminkreya@yopmail.com. Create the user in Supabase Auth first, then re-run this migration.';
    return;
  end if;

  insert into public.profiles (id, full_name, role, created_at)
  values (target_user_id, 'Kreya Admin', 'admin', timezone('utc', now()))
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role;
end;
$$;
