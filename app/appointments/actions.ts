"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appointmentSchema, type AppointmentSchema } from "@/lib/validators/appointment";
import { isValidAppointmentSlot } from "@/lib/constants/appointments";
import { getCurrentUserContext, getPatientForCurrentUser } from "@/lib/data/ehr";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const mapAppointmentPayload = (data: AppointmentSchema) => ({
  patient_id: data.patientId,
  provider_id: data.providerId,
  scheduled_at: data.scheduledAt,
  duration_minutes: data.durationMinutes,
  status: data.status,
  location: data.location,
  notes: data.notes || null,
});

const getRedirectTarget = (formData: FormData) => {
  const redirectTo = formData.get("redirectTo");
  return typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/appointments";
};

const getScheduledAtValue = (formData: FormData) => {
  const scheduledAt = formData.get("scheduledAt");
  if (typeof scheduledAt === "string" && scheduledAt.length > 0) {
    return scheduledAt;
  }

  const appointmentDate = formData.get("appointmentDate");
  const appointmentTime = formData.get("appointmentTime");

  if (typeof appointmentDate === "string" && typeof appointmentTime === "string" && appointmentDate && appointmentTime) {
    return `${appointmentDate}T${appointmentTime}`;
  }

  return "";
};

const validateAppointmentSlot = (scheduledAt: string) => {
  const time = scheduledAt.slice(11, 16);
  return isValidAppointmentSlot(time);
};

type AppointmentConflictRow = {
  id: string;
  patient_id: string;
  provider_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
};

const getResolvedAppointmentInput = async (formData: FormData) => {
  const { role, userId } = await getCurrentUserContext();
  const patient = role === "patient" ? await getPatientForCurrentUser() : null;

  return {
    role,
    userId,
    patientId: role === "patient" && userId ? userId : formData.get("patientId"),
    providerId:
      role === "provider" && userId
        ? userId
        : role === "patient"
          ? patient?.providerId ?? formData.get("providerId")
          : formData.get("providerId"),
    patient,
  };
};

const hasOverlap = (startA: Date, endA: Date, startB: Date, endB: Date) => startA < endB && startB < endA;

const assertNoAppointmentConflict = async (
  data: AppointmentSchema,
  excludeId?: string
) => {
  const supabase = await createSupabaseServerClient();
  const { data: existingData, error } = await supabase
    .from("appointments")
    .select("id, patient_id, provider_id, scheduled_at, duration_minutes, status");

  if (error) {
    return { error: error.message };
  }

  const existing = (existingData ?? []) as AppointmentConflictRow[];
  const proposedStart = new Date(data.scheduledAt);
  const proposedEnd = new Date(proposedStart.getTime() + data.durationMinutes * 60 * 1000);

  const conflict = existing.find((appointment) => {
    if (appointment.id === excludeId || appointment.status === "cancelled") {
      return false;
    }

    if (appointment.provider_id !== data.providerId && appointment.patient_id !== data.patientId) {
      return false;
    }

    const appointmentStart = new Date(appointment.scheduled_at);
    const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration_minutes * 60 * 1000);
    return hasOverlap(proposedStart, proposedEnd, appointmentStart, appointmentEnd);
  });

  if (!conflict) {
    return { error: null };
  }

  return {
    error:
      conflict.provider_id === data.providerId
        ? "This provider already has an appointment in that time slot."
        : "This patient already has an appointment in that time slot.",
  };
};

export async function createAppointmentAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const resolved = await getResolvedAppointmentInput(formData);
  const scheduledAt = getScheduledAtValue(formData);
  const submission = appointmentSchema.safeParse({
    patientId: resolved.patientId,
    providerId: resolved.providerId,
    scheduledAt,
    durationMinutes: formData.get("durationMinutes"),
    status: formData.get("status") || "scheduled",
    location: formData.get("location") || "Virtual",
    notes: formData.get("notes") || undefined,
  });

  if (!submission.success) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Please complete all appointment details.")}`);
  }

  if (!validateAppointmentSlot(submission.data.scheduledAt)) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Choose one of the available appointment time slots.")}`);
  }

  if (resolved.role === "patient" && !resolved.patient) {
    redirect(`${redirectTo}?error=${encodeURIComponent("No patient record is linked to this account.")}`);
  }

  const conflict = await assertNoAppointmentConflict(submission.data);
  if (conflict.error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(conflict.error)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("appointments").insert(mapAppointmentPayload(submission.data) as never);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath(`/patients/${submission.data.patientId}`);
  redirect(`${redirectTo}?success=saved`);
}

export async function updateAppointmentAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const id = formData.get("id");
  const resolved = await getResolvedAppointmentInput(formData);
  const scheduledAt = getScheduledAtValue(formData);

  const submission = appointmentSchema.safeParse({
    patientId: resolved.patientId,
    providerId: resolved.providerId,
    scheduledAt,
    durationMinutes: formData.get("durationMinutes"),
    status: formData.get("status") || "scheduled",
    location: formData.get("location") || "Virtual",
    notes: formData.get("notes") || undefined,
  });

  if (!id || typeof id !== "string") {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing appointment id")}`);
  }

  if (!submission.success) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Please fix the appointment details before saving.")}`);
  }

  if (!validateAppointmentSlot(submission.data.scheduledAt)) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Choose one of the available appointment time slots.")}`);
  }

  const conflict = await assertNoAppointmentConflict(submission.data, id);
  if (conflict.error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(conflict.error)}`);
  }

  const supabase = await createSupabaseServerClient();
  let updateQuery = supabase
    .from("appointments")
    .update(mapAppointmentPayload(submission.data) as never)
    .eq("id", id);

  if (role === "provider" && userId) {
    updateQuery = updateQuery.eq("provider_id", userId);
  }

  if (role === "patient" && userId) {
    updateQuery = updateQuery.eq("patient_id", userId);
  }

  const { error } = await updateQuery;

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath(`/patients/${submission.data.patientId}`);
  redirect(`${redirectTo}?success=updated`);
}

export async function deleteAppointmentAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const id = formData.get("id");
  if (!id) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing appointment id")}`);
  }

  const supabase = await createSupabaseServerClient();
  let deleteQuery = supabase.from("appointments").delete().eq("id", id);

  if (role === "provider" && userId) {
    deleteQuery = deleteQuery.eq("provider_id", userId);
  }

  if (role === "patient" && userId) {
    deleteQuery = deleteQuery.eq("patient_id", userId);
  }

  const { error } = await deleteQuery;

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  redirect(`${redirectTo}?success=cancelled`);
}
