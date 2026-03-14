import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getBrowserEnv } from "@/lib/env";
import type { Database } from "@/types/database";

const getSupabaseKeys = () => {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getBrowserEnv();
  return { url: NEXT_PUBLIC_SUPABASE_URL, key: NEXT_PUBLIC_SUPABASE_ANON_KEY };
};

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseKeys();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can read request cookies but may not be able to persist updates.
        }
      },
    },
  });
};

export const createSupabaseReadOnlyClient = async () => {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseKeys();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
};
