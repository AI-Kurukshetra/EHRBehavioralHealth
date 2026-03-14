import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getBrowserEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/auth";

const getAdminConfig = () => {
  const { NEXT_PUBLIC_SUPABASE_URL } = getBrowserEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to invite provider and patient accounts.");
  }

  return {
    url: NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    appUrl,
  };
};

export const createSupabaseAdminClient = () => {
  const { url, serviceRoleKey } = getAdminConfig();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

type EnsureRoleAccountInput = {
  email: string;
  fullName: string;
  role: UserRole;
};

export const ensureRoleAccount = async ({ email, fullName, role }: EnsureRoleAccountInput) => {
  const admin = createSupabaseAdminClient();
  const { appUrl } = getAdminConfig();

  const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  let user = existingUsers.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase()) ?? null;
  let inviteSent = false;

  if (!user) {
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role,
      },
      redirectTo: `${appUrl}/auth/confirm?next=/set-password`,
    });

    if (inviteError) {
      throw inviteError;
    }

    user = inviteData.user;
    inviteSent = true;
  }

  if (!user) {
    throw new Error("Unable to provision auth user.");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      role,
    },
    {
      onConflict: "id",
    }
  );

  if (profileError) {
    throw profileError;
  }

  return {
    userId: user.id,
    inviteSent,
    existed: !inviteSent,
  };
};
