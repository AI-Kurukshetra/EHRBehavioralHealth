create table if not exists public.providers (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text not null unique,
    phone text,
    specialty text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create trigger on_providers_updated
before update on public.providers
for each row execute function public.touch_updated_at();
