import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { getAppointments, getClinicalNotes, getCurrentUserContext, getPatientById, getTreatmentPlans, scopeRecordsToCurrentProvider } from "@/lib/data/ehr";

interface PatientDetailPageProps {
  params: { id: string };
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { role, userId } = await getCurrentUserContext();
  const patient = await getPatientById(params.id);

  if (!patient || (role === "provider" && userId && patient.providerId !== userId)) {
    notFound();
  }

  const [appointments, notes, plans] = await Promise.all([
    getAppointments(),
    getClinicalNotes(),
    getTreatmentPlans(),
  ]);
  const scopedAppointments = await scopeRecordsToCurrentProvider(appointments);
  const scopedNotes = await scopeRecordsToCurrentProvider(notes);
  const scopedPlans = await scopeRecordsToCurrentProvider(plans);

  const patientAppointments = scopedAppointments.filter((appt) => appt.patientId === patient.id);
  const patientNotes = scopedNotes.filter((note) => note.patientId === patient.id);
  const patientPlans = scopedPlans.filter((plan) => plan.patientId === patient.id);
  const patientPlan = patientPlans[0];

  return (
    <DashboardShell title={patient.fullName} subtitle={`Status: ${patient.status}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Contact">
          <p>Email: {patient.email}</p>
          <p>Phone: {patient.phone}</p>
          <p>Provider ID: {patient.providerId}</p>
        </Card>
        <Card title="Treatment Plan" value={patientPlan?.title ?? "Not assigned"}>
          {patientPlan?.goals ?? "Assign a treatment plan to track progress."}
        </Card>
      </div>
      <Card title="Upcoming Appointments" className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            {patientAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{new Date(appointment.scheduledAt).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{appointment.status}</td>
                <td className="px-4 py-2">{appointment.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Treatment plan history">
        <div className="space-y-3">
          {patientPlans.length === 0 ? (
            <p className="text-sm text-slate-500">Assign a treatment plan to track progress.</p>
          ) : (
            patientPlans.map((plan) => (
              <div key={plan.id} className="rounded-lg bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{plan.title}</p>
                  <span className="text-xs uppercase tracking-wide text-slate-500">{plan.status}</span>
                </div>
                <p className="mt-2 text-slate-600">{plan.goals}</p>
                <p className="mt-1 text-sm text-slate-500">Interventions: {plan.interventions}</p>
              </div>
            ))
          )}
        </div>
      </Card>
      <Card title="Recent Notes">
        <ul className="space-y-3 text-sm">
          {patientNotes.map((note) => (
            <li key={note.id} className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
              <p className="font-semibold text-slate-900">{note.title}</p>
              <p className="text-slate-600">{note.summary ?? note.content}</p>
            </li>
          ))}
        </ul>
      </Card>
    </DashboardShell>
  );
}
