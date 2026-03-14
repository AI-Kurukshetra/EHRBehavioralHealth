"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const queryError = searchParams.get("error");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setError(error?.message ?? "Unable to log in. Please try again.");
      setLoading(false);
      return;
    }

    // Let middleware resolve the user's role and redirect to
    // the correct dashboard once the auth cookies are available.
    router.replace(redirectTo || "/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
      {!error && queryError === "profile" ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Your account is missing a profile or role assignment. Update the matching `public.profiles` row in Supabase and try again.
        </p>
      ) : null}
      {!error && queryError === "invite" ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Your invite link could not be completed. Request a fresh invite email and open it again.
        </p>
      ) : null}
      <label className="text-sm font-medium text-slate-600">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow focus:ring-2 focus:ring-indigo-100"
          required
        />
      </label>
      <label className="text-sm font-medium text-slate-600">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow focus:ring-2 focus:ring-indigo-100"
          required
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
