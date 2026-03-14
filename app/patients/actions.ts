"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { patientSchema, type PatientSchema } from "@/lib/validators/patient";
import { getCurrentUserContext } from "@/lib/data/ehr";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureRoleAccount } from "@/lib/supabase/admin";

type ProviderDirectoryRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  specialty: string | null;
};

const mapPatientPayload = (data: PatientSchema) => ({
  full_name: data.fullName,
  email: data.email || null,
  phone: data.phone || null,
  date_of_birth: data.dateOfBirth || null,
  provider_id: data.providerId,
  status: data.status,
});

const resolveAssignableProviderId = async (providerId: string) => {
  const supabase = await createSupabaseServerClient();

  const { data: providerProfileData } = await supabase.from("profiles").select("id").eq("id", providerId).maybeSingle();
  const providerProfile = providerProfileData as { id: string } | null;

  if (providerProfile) {
    return providerProfile.id;
  }

  const { data: providerRecordData } = await supabase
    .from("providers")
    .select("id, full_name, email, phone, specialty")
    .eq("id", providerId)
    .maybeSingle();
  const providerRecord = providerRecordData as ProviderDirectoryRow | null;

  if (!providerRecord) {
    throw new Error("Select a valid provider before assigning a patient.");
  }

  if (!providerRecord.email) {
    throw new Error("Selected provider is missing an email address, so a login account cannot be created.");
  }

  const account = await ensureRoleAccount({
    email: providerRecord.email,
    fullName: providerRecord.full_name ?? "Provider",
    role: "provider",
  });

  await supabase.from("providers").upsert(
    {
      id: account.userId,
      full_name: providerRecord.full_name ?? "Provider",
      email: providerRecord.email,
      phone: providerRecord.phone,
      specialty: providerRecord.specialty,
    } as never,
    {
      onConflict: "id",
    }
  );

  if (providerRecord.id !== account.userId) {
    await supabase.from("providers").delete().eq("id", providerRecord.id);
  }

  return account.userId;
};

export async function createPatientAction(formData: FormData) {
  const { role, userId } = await getCurrentUserContext();
  const submission = patientSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    providerId: role === "provider" && userId ? userId : formData.get("providerId"),
    status: formData.get("status") || "active",
  });
  const shouldInvite = formData.get("createAccount") === "on";

  if (!submission.success) {
    redirect(`/patients?error=${encodeURIComponent("Please fill out all required patient fields.")}`);
  }

  const supabase = await createSupabaseServerClient();
  let resolvedProviderId: string;

  try {
    resolvedProviderId = await resolveAssignableProviderId(submission.data.providerId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate the selected provider.";
    redirect(`/patients?error=${encodeURIComponent(message)}`);
  }

  if (submission.data.email) {
    const { data: existingPatient } = await supabase.from("patients").select("id").eq("email", submission.data.email).maybeSingle();

    if (existingPatient) {
      redirect(`/patients?error=${encodeURIComponent("A patient with that email already exists.")}`);
    }
  }

  let patientId: string | undefined;
  let credentialsCreated = false;

  if (shouldInvite) {
    if (!submission.data.email) {
      redirect(`/patients?error=${encodeURIComponent("Patient email is required to send a portal invite.")}`);
    }

    try {
      const account = await ensureRoleAccount({
        email: submission.data.email,
        fullName: submission.data.fullName,
        role: "patient",
      });
      patientId = account.userId;
      credentialsCreated = account.credentialsCreated;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create patient login account.";
      redirect(`/patients?error=${encodeURIComponent(message)}`);
    }
  }

  const payload = {
    ...(patientId ? { id: patientId } : {}),
    ...mapPatientPayload({
      ...submission.data,
      providerId: resolvedProviderId,
    }),
  };

  const { error } = await supabase.from("patients").insert(payload as never);

  if (error) {
    redirect(`/patients?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/patients");
  redirect(`/patients?success=${credentialsCreated ? "credentials" : "saved"}`);
}

const updateSchema = patientSchema.extend({
  id: z.string().min(1, "Patient id missing"),
});

export async function updatePatientAction(formData: FormData) {
  const { role, userId } = await getCurrentUserContext();
  const submission = updateSchema.safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    providerId: role === "provider" && userId ? userId : formData.get("providerId"),
    status: formData.get("status") || "active",
  });

  if (!submission.success) {
    redirect(`/patients?error=${encodeURIComponent("Please fix validation errors before saving.")}`);
  }

  const supabase = await createSupabaseServerClient();
  let resolvedProviderId: string;

  try {
    resolvedProviderId = await resolveAssignableProviderId(submission.data.providerId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate the selected provider.";
    redirect(`/patients?error=${encodeURIComponent(message)}`);
  }

  if (submission.data.email) {
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("id")
      .eq("email", submission.data.email)
      .neq("id", submission.data.id!)
      .maybeSingle();

    if (existingPatient) {
      redirect(`/patients?error=${encodeURIComponent("A patient with that email already exists.")}`);
    }
  }

  let updateQuery = supabase.from("patients").update(
    mapPatientPayload({
      ...submission.data,
      providerId: resolvedProviderId,
    }) as never
  );

  updateQuery = updateQuery.eq("id", submission.data.id!);

  if (role === "provider" && userId) {
    updateQuery = updateQuery.eq("provider_id", userId);
  }

  const { error } = await updateQuery;

  if (error) {
    redirect(`/patients?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/patients/${submission.data.id}`);
  revalidatePath("/patients");
  redirect("/patients?success=saved");
}

export async function deletePatientAction(formData: FormData) {
  const { role, userId } = await getCurrentUserContext();
  const id = formData.get("id");
  if (!id) {
    redirect(`/patients?error=${encodeURIComponent("Missing patient id")}`);
  }

  const supabase = await createSupabaseServerClient();
  let deleteQuery = supabase.from("patients").delete().eq("id", id);

  if (role === "provider" && userId) {
    deleteQuery = deleteQuery.eq("provider_id", userId);
  }

  const { error } = await deleteQuery;

  if (error) {
    redirect(`/patients?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/patients");
  redirect("/patients?success=saved");
}
