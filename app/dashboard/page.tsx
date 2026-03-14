import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getAppointments,
  getClinicalNotes,
  getCurrentUserContext,
  getPatients,
  getProviders,
  getTreatmentPlans,
  scopePatientsToCurrentProvider,
  scopeRecordsToCurrentProvider,
} from "@/lib/data/ehr";
import type { UserRole } from "@/types/auth";

const AdminDashboard = ({
  totalPatients,
  providerCount,
  openPlans,
  scheduledAppointments,
  completedAppointments,
}: {
  totalPatients: number;
  providerCount: number;
  openPlans: number;
  scheduledAppointments: number;
  completedAppointments: number;
}) => (
  <>
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Active Patients" value={String(totalPatients)} />
      <Card title="Providers" value={String(providerCount)} />
      <Card title="Open Treatment Plans" value={String(openPlans)} />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Appointment Throughput" value={`${scheduledAppointments} scheduled`}>
        {completedAppointments} completed visits recorded so far.
      </Card>
      <Card title="Ops Checklist">
        {"Verify clinician documentation is signed off, review onboarding queue, and confirm billing exports for the week."}
      </Card>
    </div>
  </>
);

const ProviderDashboard = ({
  upcomingCount,
  pendingNotes,
  careSummaries,
  activePatients,
  nextSession,
}: {
  upcomingCount: number;
  pendingNotes: number;
  careSummaries: string[];
  activePatients: number;
  nextSession?: string;
}) => (
  <>
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Upcoming Sessions" value={String(upcomingCount)} />
      <Card title="Notes to Sign" value={String(pendingNotes)} />
      <Card title="Active Caseload" value={String(activePatients)} />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Today’s Focus">
        {careSummaries[0] ?? "Prep CBT materials for afternoon sessions."}
        {nextSession ? <p className="mt-2 text-sm text-slate-500">Next session: {nextSession}</p> : null}
      </Card>
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
  const { role } = await getCurrentUserContext();
  const [patients, appointments, notes, plans, providers] = await Promise.all([
    getPatients(),
    getAppointments(),
    getClinicalNotes(),
    getTreatmentPlans(),
    role === "admin" ? getProviders() : Promise.resolve([]),
  ]);

  const scopedPatients = await scopePatientsToCurrentProvider(patients);
  const scopedAppointments = await scopeRecordsToCurrentProvider(appointments);
  const scopedNotes = await scopeRecordsToCurrentProvider(notes);
  const scopedPlans = await scopeRecordsToCurrentProvider(plans);

  const upcomingAppointments = scopedAppointments.filter((appt) => new Date(appt.scheduledAt) > new Date());
  const providerCount = new Set(scopedPatients.map((patient) => patient.providerId)).size;
  const careSummaries = scopedPlans.map((plan) => plan.title);
  const pendingNotes = scopedNotes.filter((note) => note.visibility === "provider").length;
  const scheduledAppointments = scopedAppointments.filter((appt) => appt.status === "scheduled").length;
  const completedAppointments = scopedAppointments.filter((appt) => appt.status === "completed").length;
  const nextSession = upcomingAppointments[0]?.scheduledAt ? new Date(upcomingAppointments[0].scheduledAt).toLocaleString() : undefined;

  return (
    <DashboardShell title="Dashboard" subtitle="Operational overview at a glance">
      {role === "admin" && (
        <>
          <AdminDashboard
            totalPatients={scopedPatients.length}
            providerCount={providerCount}
            openPlans={scopedPlans.length}
            scheduledAppointments={scheduledAppointments}
            completedAppointments={completedAppointments}
          />
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
        <ProviderDashboard
          upcomingCount={upcomingAppointments.length}
          pendingNotes={pendingNotes}
          careSummaries={careSummaries}
          activePatients={scopedPatients.length}
          nextSession={nextSession}
        />
      )}
      {role === "patient" && <PatientDashboard />}
    </DashboardShell>
  );
}
