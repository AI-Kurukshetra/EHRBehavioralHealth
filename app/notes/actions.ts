"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clinicalNoteSchema, type ClinicalNoteSchema } from "@/lib/validators/clinical-note";
import { getCurrentUserContext } from "@/lib/data/ehr";
import { generateClinicalNoteSummary } from "@/lib/ai/groq";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const toPayload = (data: ClinicalNoteSchema) => ({
  appointment_id: data.appointmentId,
  patient_id: data.patientId,
  provider_id: data.providerId,
  title: data.title,
  summary: data.summary || null,
  content: data.content,
  visibility: data.visibility,
});

const getRedirectTarget = (formData: FormData) => {
  const redirectTo = formData.get("redirectTo");
  return typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/notes";
};

type AppointmentOwnershipRow = {
  id: string;
  patient_id: string;
  provider_id: string;
};

const validateLinkedAppointment = async (data: ClinicalNoteSchema) => {
  const supabase = await createSupabaseServerClient();
  const { data: appointmentData, error } = await supabase
    .from("appointments")
    .select("id, patient_id, provider_id")
    .eq("id", data.appointmentId)
    .maybeSingle();

  if (error) {
    return error.message;
  }

  const appointment = appointmentData as AppointmentOwnershipRow | null;

  if (!appointment) {
    return "Select a valid appointment before saving the note.";
  }

  if (appointment.patient_id !== data.patientId || appointment.provider_id !== data.providerId) {
    return "The selected appointment does not match the chosen patient/provider.";
  }

  return null;
};

export async function createNoteAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const submission = clinicalNoteSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    patientId: formData.get("patientId"),
    providerId: role === "provider" && userId ? userId : formData.get("providerId"),
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    content: formData.get("content"),
    visibility: formData.get("visibility") || "provider",
  });

  if (!submission.success) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Please complete all required note fields.")}`);
  }

  const appointmentError = await validateLinkedAppointment(submission.data);
  if (appointmentError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(appointmentError)}`);
  }

  const summary = submission.data.summary || (await generateClinicalNoteSummary(submission.data.content)) || undefined;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("clinical_notes")
    .insert(toPayload({ ...submission.data, summary }) as never);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath(`/patients/${submission.data.patientId}`);
  redirect(`${redirectTo}?success=saved`);
}

export async function updateNoteAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const id = formData.get("id");
  const submission = clinicalNoteSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    patientId: formData.get("patientId"),
    providerId: role === "provider" && userId ? userId : formData.get("providerId"),
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    content: formData.get("content"),
    visibility: formData.get("visibility") || "provider",
  });

  if (!id || typeof id !== "string") {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing note id")}`);
  }

  if (!submission.success) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Please fix the note details before saving.")}`);
  }

  const appointmentError = await validateLinkedAppointment(submission.data);
  if (appointmentError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(appointmentError)}`);
  }

  const summary = submission.data.summary || (await generateClinicalNoteSummary(submission.data.content)) || undefined;
  const supabase = await createSupabaseServerClient();
  let updateQuery = supabase
    .from("clinical_notes")
    .update(toPayload({ ...submission.data, summary }) as never)
    .eq("id", id);

  if (role === "provider" && userId) {
    updateQuery = updateQuery.eq("provider_id", userId);
  }

  const { error } = await updateQuery;

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath(`/patients/${submission.data.patientId}`);
  redirect(`${redirectTo}?success=updated`);
}

export async function deleteNoteAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const id = formData.get("id");
  if (!id) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing note id")}`);
  }

  const supabase = await createSupabaseServerClient();
  let deleteQuery = supabase.from("clinical_notes").delete().eq("id", id);

  if (role === "provider" && userId) {
    deleteQuery = deleteQuery.eq("provider_id", userId);
  }

  const { error } = await deleteQuery;

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  redirect(`${redirectTo}?success=deleted`);
}
