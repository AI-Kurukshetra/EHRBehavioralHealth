import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%),_rgb(243,246,255)] px-4 py-16">
      <div className="glass-panel w-full max-w-md border border-white/60 p-8">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Sign in to continue to BehavioralHealth-EHR.</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
