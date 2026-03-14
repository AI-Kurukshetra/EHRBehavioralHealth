import { cookies } from "next/headers";
import { placeholderAppointments, placeholderNotes, placeholderPatients, placeholderTreatmentPlans } from "@/lib/fixtures/ehr";
import type { Appointment, ClinicalNote, Patient, Provider, TreatmentPlan } from "@/types/ehr";

type RawProviderRow = {
  id: string;
  full_name?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  specialty?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
};

const withFallback = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn("Supabase data unavailable, using placeholder data", error);
    return fallback;
  }
};

const serverFetch = async <T>(
  table: string,
  select = "*",
  order: { column: string; ascending?: boolean } = { column: "created_at", ascending: false }
) => {
  const { createSupabaseReadOnlyClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseReadOnlyClient();
  const query = supabase.from(table).select(select).order(order.column, { ascending: order.ascending });
  const { data, error } = await query;
  if (error || !data) {
    throw error ?? new Error(`No data returned for ${table}`);
  }
  return data as T;
};

export const getPatients = () =>
  withFallback(
    () =>
      serverFetch<Patient[]>(
        "patients",
        "id, fullName:full_name, email, phone, dateOfBirth:date_of_birth, providerId:provider_id, status, createdAt:created_at, updatedAt:updated_at"
      ),
    placeholderPatients
  );

export const getPatientById = async (id: string) => {
  const patients = await getPatients();
  return patients.find((patient) => patient.id === id) ?? null;
};

export const getAppointments = () =>
  withFallback(
    () =>
      serverFetch<Appointment[]>(
        "appointments",
        "id, patientId:patient_id, providerId:provider_id, scheduledAt:scheduled_at, durationMinutes:duration_minutes, status, location, notes, createdAt:created_at, updatedAt:updated_at"
      ),
    placeholderAppointments
  );

export const getClinicalNotes = () =>
  withFallback(
    () =>
      serverFetch<ClinicalNote[]>(
        "clinical_notes",
        "id, appointmentId:appointment_id, patientId:patient_id, providerId:provider_id, title, summary, content, visibility, createdAt:created_at, updatedAt:updated_at"
      ),
    placeholderNotes
  );

export const getTreatmentPlans = () =>
  withFallback(
    () =>
      serverFetch<TreatmentPlan[]>(
        "treatment_plans",
        "id, patientId:patient_id, providerId:provider_id, title, goals, interventions, reviewDate:review_date, status, createdAt:created_at, updatedAt:updated_at"
      ),
    placeholderTreatmentPlans
  );

export const getProviders = () =>
  withFallback(
    async () => {
      const data = await serverFetch<RawProviderRow[]>("providers");
      return data.map((provider) => ({
        id: provider.id,
        fullName: provider.full_name ?? provider.fullName ?? "Provider",
        email: provider.email ?? "unknown@example.com",
        phone: provider.phone ?? undefined,
        specialty: provider.specialty ?? undefined,
        createdAt: provider.created_at ?? provider.createdAt ?? new Date().toISOString(),
        updatedAt: provider.updated_at ?? provider.updatedAt ?? new Date().toISOString(),
      })) as Provider[];
    },
    []
  );

export const getRoleFromCookies = async (): Promise<string> => {
  const cookieStore = await cookies();
  return decodeURIComponent(cookieStore.get("bh_role")?.value ?? "provider");
};

export const getDisplayNameFromCookies = async (): Promise<string> => {
  const cookieStore = await cookies();
  return decodeURIComponent(cookieStore.get("bh_full_name")?.value ?? "Team Member");
};

export const getUserIdFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("bh_user_id")?.value;
  return userId ? decodeURIComponent(userId) : null;
};

export const getPatientForCurrentUser = async () => {
  const userId = await getUserIdFromCookies();

  if (!userId) {
    return null;
  }

  const patients = await getPatients();
  return patients.find((patient) => patient.id === userId) ?? null;
};

export const getCurrentUserContext = async () => {
  const [role, userId] = await Promise.all([getRoleFromCookies(), getUserIdFromCookies()]);

  return {
    role,
    userId,
    isProvider: role === "provider" && Boolean(userId),
  };
};

export const scopeRecordsToCurrentProvider = async <T extends { providerId: string }>(records: T[]) => {
  const { role, userId } = await getCurrentUserContext();

  if (role !== "provider" || !userId) {
    return records;
  }

  return records.filter((record) => record.providerId === userId);
};

export const scopePatientsToCurrentProvider = async (patients: Patient[]) => {
  const { role, userId } = await getCurrentUserContext();

  if (role !== "provider" || !userId) {
    return patients;
  }

  return patients.filter((patient) => patient.providerId === userId);
};
