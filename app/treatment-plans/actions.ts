"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { treatmentPlanSchema, type TreatmentPlanSchema } from "@/lib/validators/treatment-plan";
import { getCurrentUserContext } from "@/lib/data/ehr";
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

const getRedirectTarget = (formData: FormData) => {
  const redirectTo = formData.get("redirectTo");
  return typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/treatment-plans";
};

type PatientOwnershipRow = {
  id: string;
  provider_id: string;
};

const validateTreatmentPlanPatient = async (data: TreatmentPlanSchema) => {
  const supabase = await createSupabaseServerClient();
  const { data: patientData, error } = await supabase
    .from("patients")
    .select("id, provider_id")
    .eq("id", data.patientId)
    .maybeSingle();

  if (error) {
    return error.message;
  }

  const patient = patientData as PatientOwnershipRow | null;

  if (!patient) {
    return "Select a valid patient before saving the treatment plan.";
  }

  if (patient.provider_id !== data.providerId) {
    return "The selected patient is not assigned to that provider.";
  }

  return null;
};

export async function createTreatmentPlanAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const submission = treatmentPlanSchema.safeParse({
    patientId: formData.get("patientId"),
    providerId: role === "provider" && userId ? userId : formData.get("providerId"),
    title: formData.get("title"),
    goals: formData.get("goals"),
    interventions: formData.get("interventions"),
    status: formData.get("status") || "active",
    reviewDate: formData.get("reviewDate") || undefined,
  });

  if (!submission.success) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Please complete all required treatment plan fields.")}`);
  }

  const patientError = await validateTreatmentPlanPatient(submission.data);
  if (patientError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(patientError)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("treatment_plans").insert(toPlanPayload(submission.data) as never);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/treatment-plans");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath(`/patients/${submission.data.patientId}`);
  redirect(`${redirectTo}?success=saved`);
}

export async function updateTreatmentPlanAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const id = formData.get("id");
  const submission = treatmentPlanSchema.safeParse({
    patientId: formData.get("patientId"),
    providerId: role === "provider" && userId ? userId : formData.get("providerId"),
    title: formData.get("title"),
    goals: formData.get("goals"),
    interventions: formData.get("interventions"),
    status: formData.get("status") || "active",
    reviewDate: formData.get("reviewDate") || undefined,
  });

  if (!id || typeof id !== "string") {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing treatment plan id")}`);
  }

  if (!submission.success) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Please fix the treatment plan before saving.")}`);
  }

  const patientError = await validateTreatmentPlanPatient(submission.data);
  if (patientError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(patientError)}`);
  }

  const supabase = await createSupabaseServerClient();
  let updateQuery = supabase
    .from("treatment_plans")
    .update(toPlanPayload(submission.data) as never)
    .eq("id", id);

  if (role === "provider" && userId) {
    updateQuery = updateQuery.eq("provider_id", userId);
  }

  const { error } = await updateQuery;

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/treatment-plans");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath(`/patients/${submission.data.patientId}`);
  redirect(`${redirectTo}?success=updated`);
}

export async function deleteTreatmentPlanAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData);
  const { role, userId } = await getCurrentUserContext();
  const id = formData.get("id");
  if (!id) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing treatment plan id")}`);
  }

  const supabase = await createSupabaseServerClient();
  let deleteQuery = supabase.from("treatment_plans").delete().eq("id", id);

  if (role === "provider" && userId) {
    deleteQuery = deleteQuery.eq("provider_id", userId);
  }

  const { error } = await deleteQuery;

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/treatment-plans");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  redirect(`${redirectTo}?success=deleted`);
}
