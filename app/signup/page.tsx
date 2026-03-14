import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.15),_transparent_55%),_rgb(243,246,255)] px-4 py-16">
      <div className="glass-panel w-full max-w-md border border-white/60 p-8">
        <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Sign up to access the BehavioralHealth-EHR portal.</p>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
