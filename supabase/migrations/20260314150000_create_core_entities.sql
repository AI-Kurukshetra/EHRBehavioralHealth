create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

create table if not exists public.patients (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text,
    phone text,
    date_of_birth date,
    provider_id uuid not null references public.profiles(id) on delete restrict,
    status text not null default 'active',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger on_patients_updated
before update on public.patients
for each row execute function public.touch_updated_at();

create index if not exists patients_provider_idx on public.patients(provider_id);
create index if not exists patients_status_idx on public.patients(status);

create table if not exists public.appointments (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid not null references public.patients(id) on delete cascade,
    provider_id uuid not null references public.profiles(id) on delete restrict,
    scheduled_at timestamptz not null,
    duration_minutes integer not null default 50,
    status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
    location text default 'Virtual',
    notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger on_appointments_updated
before update on public.appointments
for each row execute function public.touch_updated_at();

create index if not exists appointments_patient_idx on public.appointments(patient_id);
create index if not exists appointments_provider_idx on public.appointments(provider_id);
create index if not exists appointments_status_idx on public.appointments(status);

create table if not exists public.clinical_notes (
    id uuid primary key default gen_random_uuid(),
    appointment_id uuid not null references public.appointments(id) on delete cascade,
    patient_id uuid not null references public.patients(id) on delete cascade,
    provider_id uuid not null references public.profiles(id) on delete restrict,
    title text not null,
    summary text,
    content text not null,
    visibility text not null default 'provider',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger on_clinical_notes_updated
before update on public.clinical_notes
for each row execute function public.touch_updated_at();

create index if not exists notes_patient_idx on public.clinical_notes(patient_id);
create index if not exists notes_provider_idx on public.clinical_notes(provider_id);

create table if not exists public.treatment_plans (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid not null references public.patients(id) on delete cascade,
    provider_id uuid not null references public.profiles(id) on delete restrict,
    title text not null,
    goals text,
    interventions text,
    review_date date,
    status text not null default 'active' check (status in ('active', 'paused', 'completed')),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger on_treatment_plans_updated
before update on public.treatment_plans
for each row execute function public.touch_updated_at();

create index if not exists plan_patient_idx on public.treatment_plans(patient_id);
create index if not exists plan_status_idx on public.treatment_plans(status);
