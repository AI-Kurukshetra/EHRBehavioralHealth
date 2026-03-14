-- Seed administrative user for BehavioralHealth-EHR
-- Email: adminehr@yopmail.com | Password: AdminEHR!234

do $$
declare
  admin_id constant uuid := '00000000-0000-0000-0000-00000000b777';
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    confirmation_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'adminehr@yopmail.com',
    crypt('AdminEHR!234', gen_salt('bf')),
    timezone('utc', now()),
    null,
    timezone('utc', now()),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Behavioral Admin"}',
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    updated_at = excluded.updated_at;

  insert into public.profiles (id, full_name, role, created_at)
  values (admin_id, 'Behavioral Admin', 'admin', timezone('utc', now()))
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role;
end;
$$;
