# Skill: Supabase Guidelines

Authentication is handled using Supabase Auth.

Users sign in using email and password.

Roles are stored in a `profiles` table.

profiles table:

id → references auth.users.id
full_name
role (admin | provider | patient)

Database access should use the Supabase client located at:

lib/supabase/client.ts

All schema updates must be created as SQL migrations.
