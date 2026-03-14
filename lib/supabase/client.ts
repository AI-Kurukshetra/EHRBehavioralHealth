import { createBrowserClient } from "@supabase/ssr";
import { getBrowserEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export const createSupabaseBrowserClient = () => {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getBrowserEnv();

  return createBrowserClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
};
