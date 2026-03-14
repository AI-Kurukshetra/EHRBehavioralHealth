import Link from "next/link";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Care team workflow",
    description: "Manage patients, appointments, notes, and treatment plans from a single behavioral health workspace.",
  },
  {
    title: "Patient-friendly portal",
    description: "Let patients review shared notes, treatment plans, upcoming visits, and AI-powered plain-language explanations.",
  },
  {
    title: "Built for demo-ready teams",
    description: "Role-based access for admins, providers, and patients with a clean MVP flow for fast iteration.",
  },
];

const roleCards = [
  {
    title: "Admin",
    description: "Oversee providers, manage the system, and monitor operational activity across the platform.",
  },
  {
    title: "Provider",
    description: "Schedule sessions, document care, assign treatment plans, and track each patient caseload.",
  },
  {
    title: "Patient",
    description: "Review visits, understand care instructions in simple language, and stay engaged between sessions.",
  },
];

export default function IndexPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]">
      <section className="px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">BehavioralHealth</p>
            <p className="text-sm font-semibold text-slate-900">EHR Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="px-4">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="px-4">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10 pt-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Behavioral health care operations
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">
                A clean EHR experience for admins, providers, and patients.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Coordinate appointments, document care, assign treatment plans, and give patients simpler explanations of
                their notes and next steps.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="px-6 py-3">
                <Link href="/login">Go to login</Link>
              </Button>
              <Button asChild variant="secondary" className="px-6 py-3">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_rgba(99,102,241,0.14)] backdrop-blur">
            <div className="grid gap-4">
              <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-lg">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Today at a glance</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-semibold">12</p>
                    <p className="text-xs text-slate-300">Active patients</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-semibold">5</p>
                    <p className="text-xs text-slate-300">Sessions booked</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-semibold">3</p>
                    <p className="text-xs text-slate-300">Plans to review</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Patient AI explainers</p>
                <p className="mt-2 text-sm text-slate-600">
                  Turn clinical notes and treatment plans into patient-friendly explanations with helpful home-care guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Why this platform</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Relevant workflows in one place</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Built for every role</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Relevant experiences for each user</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {roleCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
