# BehavioralHealth-EHR

Full-stack Next.js (App Router) starter for a behavioral health EHR dashboard. The project ships with Tailwind CSS, TypeScript, ESLint, Prettier, Supabase scaffolding, and a modular folder layout ready for iterative development.

## Getting Started

1. Install dependencies (already installed locally):

```bash
npm install
```

2. Copy `.env.local` (already provided) and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the dev server:

```bash
npm run dev
```

Visit http://localhost:3000 to see the role-aware dashboard shell with sidebar navigation and page routing between Dashboard, Patients, Appointments, Notes, Treatment Plans, and the Patient Portal.

## NPM Scripts

- `npm run dev` – start the Next.js dev server
- `npm run build` – create a production build
- `npm start` – run the production server
- `npm run lint` – lint with ESLint
- `npm run format` – Prettier check (update the command to `--write` when ready)

## Project Structure

```
app/
  dashboard|patients|appointments|notes|treatment-plans|portal routes
components/
  layout|ui|forms building blocks
hooks/ – routing-aware helpers (role-filtered navigation)
lib/
  env validation + Supabase clients + validators + placeholder fixtures + data repositories
supabase/
  migrations/*.sql (profiles + core domain tables)
utils/ – shared utilities (date helpers)
```

Each feature uses the reusable `DashboardShell` layout (sidebar + header + content) plus shared `Card` and table components to keep UI wiring lightweight. Server actions with Zod validation live next to their routes to handle CRUD flows.

## Supabase

Environment validation lives in `lib/env.ts`, and Supabase helpers reside in `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server/server actions). Replace `types/database.ts` once you generate Supabase types and add SQL files under `supabase/migrations/` as migrations evolve.

### Database migrations

Run the SQL files inside `supabase/migrations` against your Supabase project (CLI or SQL editor). The latest migration (`20260314150000_create_core_entities.sql`) provisions:

- `patients` (links to providers via `profiles`)
- `appointments` (links to patients + providers)
- `clinical_notes` (links to appointments)
- `treatment_plans` (links to patients)

All tables include UUID PKs, timestamps, FK constraints, and `updated_at` triggers.

### MVP modules

- `/dashboard` – role-based admin/provider/patient views
- `/patients` + `/patients/[id]` – caseload table, onboarding form, and patient rollups
- `/appointments` – scheduling board with create/cancel forms
- `/notes` – clinical note feed with add/delete flows
- `/treatment-plans` – treatment plan registry + form
- `/portal` – patient portal with appointments, plans, and notes

Each route consumes Supabase data when available and gracefully falls back to curated placeholder fixtures, ensuring the UI is demo-ready even before wiring the live database.
