"use server";

import { revalidatePath } from "next/cache";
import { appointmentSchema, type AppointmentSchema } from "@/lib/validators/appointment";
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

export async function createAppointmentAction(formData: FormData) {
  const submission = appointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    providerId: formData.get("providerId"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
    status: formData.get("status") || "scheduled",
    location: formData.get("location") || "Virtual",
    notes: formData.get("notes") || undefined,
  });

  if (!submission.success) {
    return { error: submission.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("appointments").insert(mapAppointmentPayload(submission.data));

  if (error) {
    return { error: { supabase: [error.message] } };
  }

  revalidatePath("/appointments");
  return { success: true };
}

export async function deleteAppointmentAction(formData: FormData) {
  const id = formData.get("id");
  if (!id) {
    return { error: { id: ["Missing appointment id"] } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) {
    return { error: { supabase: [error.message] } };
  }

  revalidatePath("/appointments");
  return { success: true };
}
