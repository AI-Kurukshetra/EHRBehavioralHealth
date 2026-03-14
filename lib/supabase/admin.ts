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
  const temporaryPassword = process.env.DEFAULT_USER_PASSWORD ?? "Welcome@123";

  const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  let user = existingUsers.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase()) ?? null;
  let credentialsCreated = false;

  if (!user) {
    const { data: createUserData, error: createUserError } = await admin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    });

    if (createUserError) {
      throw createUserError;
    }

    user = createUserData.user;
    credentialsCreated = true;
  }

  if (!user) {
    throw new Error("Unable to provision auth user.");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      role,
    } as never,
    {
      onConflict: "id",
    }
  );

  if (profileError) {
    throw profileError;
  }

  return {
    userId: user.id,
    credentialsCreated,
    temporaryPassword: credentialsCreated ? temporaryPassword : null,
    existed: !credentialsCreated,
  };
};
