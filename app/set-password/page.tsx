import Link from "next/link";
import { SetPasswordForm } from "@/components/forms/set-password-form";

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_55%),rgb(243,246,255)] px-4 py-16">
      <div className="glass-panel w-full max-w-md border border-white/60 p-8">
        <h1 className="text-3xl font-semibold text-slate-900">Set your password</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Finish your invite by choosing a password for your BehavioralHealth-EHR account.
        </p>
        <SetPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Already signed in?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 underline">
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}
