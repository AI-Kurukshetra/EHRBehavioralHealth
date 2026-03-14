alter table public.patients enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.treatment_plans enable row level security;

drop policy if exists "patients_select_role_scoped" on public.patients;
create policy "patients_select_role_scoped"
on public.patients
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
  or id = auth.uid()
);

drop policy if exists "patients_insert_role_scoped" on public.patients;
create policy "patients_insert_role_scoped"
on public.patients
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
  or provider_id = auth.uid()
  or id = auth.uid()
);

drop policy if exists "patients_update_role_scoped" on public.patients;
create policy "patients_update_role_scoped"
on public.patients
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
  or id = auth.uid()
)
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
  or provider_id = auth.uid()
  or id = auth.uid()
);

drop policy if exists "patients_delete_role_scoped" on public.patients;
create policy "patients_delete_role_scoped"
on public.patients
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
);

drop policy if exists "clinical_notes_select_role_scoped" on public.clinical_notes;
create policy "clinical_notes_select_role_scoped"
on public.clinical_notes
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
  or (
    patient_id = auth.uid()
    and visibility = 'patient'
  )
);

drop policy if exists "clinical_notes_insert_role_scoped" on public.clinical_notes;
create policy "clinical_notes_insert_role_scoped"
on public.clinical_notes
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
      where patient.id = clinical_notes.patient_id
        and patient.provider_id = auth.uid()
    )
  )
);

drop policy if exists "clinical_notes_update_role_scoped" on public.clinical_notes;
create policy "clinical_notes_update_role_scoped"
on public.clinical_notes
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
      where patient.id = clinical_notes.patient_id
        and patient.provider_id = auth.uid()
    )
  )
);

drop policy if exists "clinical_notes_delete_role_scoped" on public.clinical_notes;
create policy "clinical_notes_delete_role_scoped"
on public.clinical_notes
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
);

drop policy if exists "treatment_plans_select_role_scoped" on public.treatment_plans;
create policy "treatment_plans_select_role_scoped"
on public.treatment_plans
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

drop policy if exists "treatment_plans_insert_role_scoped" on public.treatment_plans;
create policy "treatment_plans_insert_role_scoped"
on public.treatment_plans
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
      where patient.id = treatment_plans.patient_id
        and patient.provider_id = auth.uid()
    )
  )
);

drop policy if exists "treatment_plans_update_role_scoped" on public.treatment_plans;
create policy "treatment_plans_update_role_scoped"
on public.treatment_plans
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
      where patient.id = treatment_plans.patient_id
        and patient.provider_id = auth.uid()
    )
  )
);

drop policy if exists "treatment_plans_delete_role_scoped" on public.treatment_plans;
create policy "treatment_plans_delete_role_scoped"
on public.treatment_plans
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
);
