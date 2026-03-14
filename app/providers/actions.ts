"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureRoleAccount } from "@/lib/supabase/admin";
import { PROVIDER_SPECIALTIES } from "@/lib/constants/providers";

const providerSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  specialty: z.enum(PROVIDER_SPECIALTIES),
});

export async function createProviderAction(formData: FormData) {
  const submission = providerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    specialty: formData.get("specialty") || undefined,
  });
  const shouldInvite = formData.get("createAccount") === "on";

  if (!submission.success) {
    const error = encodeURIComponent("Please fill out all required provider fields.");
    redirect(`/providers?error=${error}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from("providers").select("id").eq("email", submission.data.email).maybeSingle();

  if (existing) {
    redirect(`/providers?error=${encodeURIComponent("A provider with that email already exists.")}`);
  }

  let providerId: string | undefined;
  let inviteSent = false;

  if (shouldInvite) {
    try {
      const account = await ensureRoleAccount({
        email: submission.data.email,
        fullName: submission.data.fullName,
        role: "provider",
      });
      providerId = account.userId;
      inviteSent = account.inviteSent;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send provider invite.";
      redirect(`/providers?error=${encodeURIComponent(message)}`);
    }
  }

  const payload = {
    ...(providerId ? { id: providerId } : {}),
    full_name: submission.data.fullName,
    email: submission.data.email,
    phone: submission.data.phone || null,
    specialty: submission.data.specialty,
  };

  const { error } = await supabase.from("providers").insert(payload);

  if (error) {
    redirect(`/providers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/providers");
  revalidatePath("/dashboard");
  redirect(`/providers?success=${inviteSent ? "invited" : "saved"}`);
}

export async function updateProviderAction(formData: FormData) {
  const submission = providerSchema.extend({ id: z.string().uuid() }).safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    specialty: formData.get("specialty"),
  });

  if (!submission.success) {
    redirect(`/providers?error=${encodeURIComponent("Please fix validation errors before saving.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("providers")
    .update({
      full_name: submission.data.fullName,
      email: submission.data.email,
      phone: submission.data.phone || null,
      specialty: submission.data.specialty,
    })
    .eq("id", submission.data.id);

  if (error) {
    redirect(`/providers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/providers");
  revalidatePath("/dashboard");
  redirect("/providers?success=1");
}

export async function deleteProviderAction(formData: FormData) {
  const id = formData.get("id");
  if (!id) {
    redirect(`/providers?error=${encodeURIComponent("Missing provider id")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("providers").delete().eq("id", id);

  if (error) {
    redirect(`/providers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/providers");
  revalidatePath("/dashboard");
  redirect("/providers?success=1");
}
