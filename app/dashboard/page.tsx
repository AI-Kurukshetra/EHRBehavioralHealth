import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAppointments, getClinicalNotes, getPatients, getProviders, getRoleFromCookies, getTreatmentPlans } from "@/lib/data/ehr";
import type { UserRole } from "@/types/auth";

const AdminDashboard = ({
  totalPatients,
  providerCount,
  openPlans,
}: {
  totalPatients: number;
  providerCount: number;
  openPlans: number;
}) => (
  <>
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Active Patients" value={String(totalPatients)} />
      <Card title="Providers" value={String(providerCount)} />
      <Card title="Open Treatment Plans" value={String(openPlans)} />
    </div>
    <Card title="Ops Checklist">
      {"Verify clinician documentation is signed off, review onboarding queue, and confirm billing exports for the week."}
    </Card>
  </>
);

const ProviderDashboard = ({
  upcomingCount,
  pendingNotes,
  careSummaries,
}: {
  upcomingCount: number;
  pendingNotes: number;
  careSummaries: string[];
}) => (
  <>
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Upcoming Sessions" value={String(upcomingCount)} />
      <Card title="Notes to Sign" value={String(pendingNotes)} />
      <Card title="Care Plans" value={String(careSummaries.length)} />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Today’s Focus">{careSummaries[0] ?? "Prep CBT materials for afternoon sessions."}</Card>
      <Card title="Safety Follow-ups">
        {"Review PHQ-9 for high-risk patients and ensure warm handoffs with the psychiatry team."}
      </Card>
    </div>
  </>
);

const PatientDashboard = () => (
  <>
    <Card title="What’s Next?" value="Join telehealth session">
      {"Tap into the portal to view your therapist's notes, upcoming assignments, and treatment goals."}
    </Card>
    <Card title="Support">
      Reach out to your care team anytime via secure messaging. We’ll respond within one business day.
    </Card>
  </>
);

export default async function DashboardPage() {
  const role = (await getRoleFromCookies()) as UserRole;
  const [patients, appointments, notes, plans, providers] = await Promise.all([
    getPatients(),
    getAppointments(),
    getClinicalNotes(),
    getTreatmentPlans(),
    role === "admin" ? getProviders() : Promise.resolve([]),
  ]);

  const upcomingAppointments = appointments.filter((appt) => new Date(appt.scheduledAt) > new Date());
  const providerCount = new Set(patients.map((patient) => patient.providerId)).size;
  const careSummaries = plans.map((plan) => plan.title);
  const pendingNotes = notes.filter((note) => note.visibility === "provider").length;

  return (
    <DashboardShell title="Dashboard" subtitle="Operational overview at a glance">
      {role === "admin" && (
        <>
          <AdminDashboard totalPatients={patients.length} providerCount={providerCount} openPlans={plans.length} />
          <Card title="Provider Directory">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Last synced {new Date().toLocaleDateString()}</p>
                <Button asChild>
                  <Link href="/providers">Manage providers</Link>
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {providers.slice(0, 4).map((provider) => (
                  <div key={provider.id} className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">{provider.fullName}</p>
                    <p className="text-sm text-slate-500">{provider.specialty ?? "Behavioral Health"}</p>
                    <p className="text-sm text-slate-500">{provider.email}</p>
                  </div>
                ))}
                {providers.length === 0 && (
                  <p className="text-sm text-slate-500">No providers yet. Add your clinical team to get started.</p>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
      {role === "provider" && (
        <ProviderDashboard upcomingCount={upcomingAppointments.length} pendingNotes={pendingNotes} careSummaries={careSummaries} />
      )}
      {role === "patient" && <PatientDashboard />}
    </DashboardShell>
  );
}
