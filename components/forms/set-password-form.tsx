"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SetPasswordForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Password set successfully. Redirecting...");
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      <label className="text-sm font-medium text-slate-600">
        New password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow focus:ring-2 focus:ring-indigo-100"
          minLength={8}
          required
        />
      </label>
      <label className="text-sm font-medium text-slate-600">
        Confirm password
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow focus:ring-2 focus:ring-indigo-100"
          minLength={8}
          required
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Set password"}
      </Button>
    </form>
  );
}
