import { cookies } from "next/headers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { PatientAiExplainer } from "@/components/portal/patient-ai-explainer";
import { signOut } from "@/app/actions/logout";
import { createAppointmentAction, deleteAppointmentAction } from "@/app/appointments/actions";
import { APPOINTMENT_TIME_SLOTS } from "@/lib/constants/appointments";
import { getAppointments, getClinicalNotes, getPatientForCurrentUser, getTreatmentPlans } from "@/lib/data/ehr";

export default async function PortalPage() {
  const cookieStore = await cookies();
  const preferredName = decodeURIComponent(cookieStore.get("bh_full_name")?.value ?? "Patient");
  const patient = await getPatientForCurrentUser();

  const bookAppointmentFromPortal = async (formData: FormData) => {
    "use server";
    await createAppointmentAction(formData);
  };

  const cancelAppointmentFromPortal = async (formData: FormData) => {
    "use server";
    await deleteAppointmentAction(formData);
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_45%),rgb(243,246,255)] px-6 py-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Card title="Portal unavailable" value="Patient record missing">
            Your account is signed in, but there is no linked patient record yet. Ask your care team to finish setting up your portal profile.
          </Card>
        </div>
      </div>
    );
  }

  const patientPlans = (await getTreatmentPlans()).filter((plan) => plan.patientId === patient.id);
  const patientNotes = (await getClinicalNotes())
    .filter((note) => note.patientId === patient.id)
    .filter((note) => note.visibility === "patient");
  const patientAppointments = (await getAppointments()).filter((appt) => appt.patientId === patient.id);
  const upcoming = patientAppointments.filter((appt) => new Date(appt.scheduledAt) > new Date());
  const pastAppointments = patientAppointments.filter((appt) => new Date(appt.scheduledAt) <= new Date());

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_45%),rgb(243,246,255)] px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="glass-panel flex flex-col gap-3 rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Patient portal</p>
              <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {preferredName.split(" ")[0]}</h1>
            </div>
            <form action={signOut}>
              <Button type="submit">
                Sign out
              </Button>
            </form>
          </div>
          <MainNav />
          <p className="mt-2 text-slate-600">
            Track upcoming appointments, treatment objectives, and provider notes from a single view.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Next Appointment" value={upcoming[0]?.scheduledAt ? new Date(upcoming[0].scheduledAt).toLocaleString() : "Unscheduled"}>
            Location: {upcoming[0]?.location ?? "Virtual"}
          </Card>
          <Card title="Active Plans" value={String(patientPlans.filter((plan) => plan.status === "active").length)}>
            Review your goals and milestones at any time.
          </Card>
          <Card title="Shared Notes" value={String(patientNotes.length)}>
            Your care team can share visit summaries here.
          </Card>
        </div>
        <Card title="Request appointment">
          <form action={bookAppointmentFromPortal} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/portal" />
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Preferred date
              <input
                name="appointmentDate"
                type="date"
                required
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Preferred time slot
              <select
                name="appointmentTime"
                defaultValue={APPOINTMENT_TIME_SLOTS[0]}
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              >
                {APPOINTMENT_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
            <input type="hidden" name="patientId" value={patient.id} />
            <input type="hidden" name="providerId" value={patient.providerId} />
            <input type="hidden" name="status" value="scheduled" />
            <label className="text-sm font-medium text-slate-600">
              Session type
              <select
                name="location"
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                defaultValue="Virtual"
              >
                <option value="Virtual">Virtual</option>
                <option value="In person">In person</option>
                <option value="Phone">Phone</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-600">
              Duration
              <select
                name="durationMinutes"
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                defaultValue="50"
              >
                <option value="30">30 minutes</option>
                <option value="50">50 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Notes for your provider
              <textarea
                name="notes"
                rows={3}
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                placeholder="Share anything your provider should know before the visit."
              />
            </label>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                Book appointment
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Upcoming appointments" className="overflow-hidden p-0">
          <div className="divide-y divide-slate-100">
            {upcoming.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">No upcoming appointments scheduled.</p>
            ) : (
              upcoming.map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{new Date(appointment.scheduledAt).toLocaleString()}</p>
                    <p className="text-sm text-slate-500">
                      {appointment.location} • {appointment.durationMinutes} minutes • {appointment.status}
                    </p>
                  </div>
                  <form action={cancelAppointmentFromPortal}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="redirectTo" value="/portal" />
                    <Button type="submit" variant="secondary" className="text-rose-600 hover:text-rose-700">
                      Cancel appointment
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card title="Treatment plan history">
          <div className="space-y-3">
            {patientPlans.length === 0 ? (
              <p className="text-sm text-slate-500">No treatment plans shared yet.</p>
            ) : (
              patientPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-white/60 bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{plan.title}</p>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                      {plan.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{plan.goals}</p>
                  <p className="mt-2 text-sm text-slate-500">Interventions: {plan.interventions}</p>
                  <PatientAiExplainer
                    type="treatment-plan"
                    title={plan.title}
                    content={`Goals: ${plan.goals}\nInterventions: ${plan.interventions}\nStatus: ${plan.status}`}
                  />
                </div>
              ))
            )}
          </div>
        </Card>
        <Card title="Shared note summaries">
          <div className="space-y-3">
            {patientNotes.length === 0 ? (
              <p className="text-sm text-slate-500">Once your provider shares visit notes, they will appear here.</p>
            ) : (
              patientNotes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-white/60 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
                  <p className="mt-1 font-semibold text-slate-900">{note.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{note.summary ?? note.content}</p>
                  <PatientAiExplainer
                    type="note"
                    title={note.title}
                    content={note.summary ?? note.content}
                  />
                </div>
              ))
            )}
          </div>
        </Card>
        <Card title="Past visits">
          <div className="space-y-3">
            {pastAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">Completed and past visits will appear here.</p>
            ) : (
              pastAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/60 bg-white/70 p-4">
                  <p className="font-medium text-slate-900">{new Date(appointment.scheduledAt).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.location} • {appointment.durationMinutes} minutes • {appointment.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
