alter table public.appointments enable row level security;

drop policy if exists "appointments_select_role_scoped" on public.appointments;
create policy "appointments_select_role_scoped"
on public.appointments
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
  or provider_id = auth.uid()
  or patient_id = auth.uid()
);

drop policy if exists "appointments_insert_role_scoped" on public.appointments;
create policy "appointments_insert_role_scoped"
on public.appointments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
  or (
    provider_id = auth.uid()
    and exists (
      select 1
      from public.patients patient
      where patient.id = appointments.patient_id
        and patient.provider_id = auth.uid()
    )
  )
  or (
    patient_id = auth.uid()
    and exists (
      select 1
      from public.patients patient
      where patient.id = auth.uid()
        and patient.provider_id = appointments.provider_id
    )
  )
);

drop policy if exists "appointments_update_role_scoped" on public.appointments;
create policy "appointments_update_role_scoped"
on public.appointments
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
  or provider_id = auth.uid()
  or patient_id = auth.uid()
)
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
  or (
    provider_id = auth.uid()
    and exists (
      select 1
      from public.patients patient
      where patient.id = appointments.patient_id
        and patient.provider_id = auth.uid()
    )
  )
  or (
    patient_id = auth.uid()
    and exists (
      select 1
      from public.patients patient
      where patient.id = auth.uid()
        and patient.provider_id = appointments.provider_id
    )
  )
);

drop policy if exists "appointments_delete_role_scoped" on public.appointments;
create policy "appointments_delete_role_scoped"
on public.appointments
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
  or provider_id = auth.uid()
  or patient_id = auth.uid()
);
