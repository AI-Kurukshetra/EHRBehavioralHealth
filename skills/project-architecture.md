# Skill: Project Architecture

Follow this architecture for the BehavioralHealth EHR project.

## Frontend

Framework:
Next.js App Router

Pages:

/login
/signup
/dashboard
/patients
/appointments
/notes

Patient portal:

/portal

## Layout

Dashboard layout includes:

Sidebar navigation
Header
Content area

Reusable components:

Card
Table
Forms
Search input

## Backend

Database: Supabase PostgreSQL

Tables:

profiles
patients
providers
appointments
clinical_notes
treatment_plans

All database changes must be added as migrations inside:

supabase/migrations
