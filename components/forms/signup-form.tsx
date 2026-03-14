"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error || !data.user) {
      setError(error?.message ?? "Unable to create your account.");
      setLoading(false);
      return;
    }

    if (fullName) {
      await supabase.from("profiles").update({ full_name: fullName } as never).eq("id", data.user.id);
    }

    setSuccess("Account created. Please sign in with your credentials.");
    setLoading(false);
    setFullName("");
    setEmail("");
    setPassword("");

    setTimeout(() => router.push("/login"), 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
      <label className="text-sm font-medium text-slate-600">
        Full name
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow focus:ring-2 focus:ring-indigo-100"
          placeholder="Jordan Diaz"
          required
        />
      </label>
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
          minLength={8}
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
