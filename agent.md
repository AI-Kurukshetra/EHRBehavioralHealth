# AI Agent Instructions — BehavioralHealth EHR

This repository contains a hackathon MVP for a **Behavioral Health Electronic Health Record (EHR) platform**.

The system helps mental health professionals manage:

* patients
* appointments
* clinical notes
* treatment plans
* documentation

The project is built using:

* Next.js 14 (App Router)
* TypeScript
* TailwindCSS
* Supabase (Auth + Database)
* Vercel deployment

## User Roles

The system supports three roles:

1. Admin
2. Provider (Therapist / Psychiatrist)
3. Patient

Roles are stored in a `profiles` table connected to `auth.users`.

## Core Modules

Admin

* system management
* provider management
* analytics

Provider

* patient management
* appointment scheduling
* clinical documentation
* treatment plans

Patient

* appointment booking
* viewing treatment progress
* accessing personal records

## Key Features (MVP)

* authentication with role-based access
* patient management
* appointment scheduling
* clinical notes
* treatment plans
* patient portal
* dashboard overview

## Architecture Rules

Frontend

* Next.js App Router
* Server Components when possible
* Tailwind for styling
* reusable UI components

Backend

* Supabase Postgres
* Supabase Auth
* migrations stored in `/supabase/migrations`

## Folder Structure

app/
components/
lib/
hooks/
types/
utils/
supabase/migrations

## Coding Expectations

The AI agent should:

* create clean, modular code
* avoid duplication
* reuse components
* keep business logic separated
* prefer server actions when appropriate

## Development Workflow

When implementing features:

1. define database schema
2. create migration
3. create API/helper functions
4. implement UI
5. connect UI to Supabase

## Goal

Build a clean **MVP Behavioral Health EHR system** suitable for a hackathon demo.


## Next.js 16 Request API Rule

When using `cookies()` or `headers()` from `next/headers`, always treat them as async.

Required patterns:
- Use `const cookieStore = await cookies()`
- Use `const headerStore = await headers()`

Never do:
- `const cookieStore = cookies()`
- `cookies().get(...)`
- `headers().get(...)`

If a helper function reads cookies or headers:
- Make the helper `async`
- Update all callers to `await` it

For Supabase SSR helpers:
- Await `cookies()` before building the client
- Prefer `getAll` / `setAll` cookie adapters over older `get` / `set` / `remove` patterns when possible

Before finishing any Next.js change:
- Search for `cookies()` and `headers()` across the repo
- Ensure no sync access remains in pages, layouts, server components, route handlers, or server actions
