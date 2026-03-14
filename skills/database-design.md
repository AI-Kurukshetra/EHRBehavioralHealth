# Skill: Database Design

The BehavioralHealth EHR system uses PostgreSQL via Supabase.

All database changes must be created as SQL migrations inside:

supabase/migrations

## Core Tables

profiles
patients
providers
appointments
clinical_notes
treatment_plans

## Relationships

profiles → linked to auth.users

patients → linked to providers

appointments → linked to patients and providers

clinical_notes → linked to appointments

treatment_plans → linked to patients

## Example Table

patients

* id (uuid)
* full_name
* date_of_birth
* phone
* email
* provider_id
* created_at

Always use:

uuid primary keys
timestamps
foreign key constraints
