"use server";

import { revalidatePath } from "next/cache";
import { treatmentPlanSchema, type TreatmentPlanSchema } from "@/lib/validators/treatment-plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const toPlanPayload = (data: TreatmentPlanSchema) => ({
  patient_id: data.patientId,
  provider_id: data.providerId,
  title: data.title,
  goals: data.goals,
  interventions: data.interventions,
  status: data.status,
  review_date: data.reviewDate || null,
});

export async function createTreatmentPlanAction(formData: FormData) {
  const submission = treatmentPlanSchema.safeParse({
    patientId: formData.get("patientId"),
    providerId: formData.get("providerId"),
    title: formData.get("title"),
    goals: formData.get("goals"),
    interventions: formData.get("interventions"),
    status: formData.get("status") || "active",
    reviewDate: formData.get("reviewDate") || undefined,
  });

  if (!submission.success) {
    return { error: submission.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("treatment_plans").insert(toPlanPayload(submission.data));

  if (error) {
    return { error: { supabase: [error.message] } };
  }

  revalidatePath("/treatment-plans");
  return { success: true };
}

export async function deleteTreatmentPlanAction(formData: FormData) {
  const id = formData.get("id");
  if (!id) {
    return { error: { id: ["Missing treatment plan id"] } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("treatment_plans").delete().eq("id", id);

  if (error) {
    return { error: { supabase: [error.message] } };
  }

  revalidatePath("/treatment-plans");
  return { success: true };
}
