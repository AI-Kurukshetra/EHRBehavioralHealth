"use server";

import { revalidatePath } from "next/cache";
import { clinicalNoteSchema, type ClinicalNoteSchema } from "@/lib/validators/clinical-note";
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

export async function createNoteAction(formData: FormData) {
  const submission = clinicalNoteSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    patientId: formData.get("patientId"),
    providerId: formData.get("providerId"),
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    content: formData.get("content"),
    visibility: formData.get("visibility") || "provider",
  });

  if (!submission.success) {
    return { error: submission.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clinical_notes").insert(toPayload(submission.data));

  if (error) {
    return { error: { supabase: [error.message] } };
  }

  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNoteAction(formData: FormData) {
  const id = formData.get("id");
  if (!id) {
    return { error: { id: ["Missing note id"] } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clinical_notes").delete().eq("id", id);

  if (error) {
    return { error: { supabase: [error.message] } };
  }

  revalidatePath("/notes");
  return { success: true };
}
