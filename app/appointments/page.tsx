import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_TIME_SLOTS, getDateInputValue, getTimeInputValue } from "@/lib/constants/appointments";
import { getAppointments, getCurrentUserContext, getPatients, scopePatientsToCurrentProvider, scopeRecordsToCurrentProvider } from "@/lib/data/ehr";
import { createAppointmentAction, deleteAppointmentAction, updateAppointmentAction } from "./actions";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { role, userId } = await getCurrentUserContext();
  const [appointments, patients] = await Promise.all([getAppointments(), getPatients()]);
  const scopedAppointments = await scopeRecordsToCurrentProvider(appointments);
  const scopedPatients = await scopePatientsToCurrentProvider(patients);
  const patientLookup = Object.fromEntries(scopedPatients.map((patient) => [patient.id, patient.fullName]));
  const upcomingAppointments = scopedAppointments.filter((appointment) => new Date(appointment.scheduledAt) > new Date());
  const completedAppointments = scopedAppointments.filter((appointment) => appointment.status === "completed");
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error ? decodeURIComponent(resolvedSearchParams.error) : null;
  const successMessage =
    resolvedSearchParams?.success === "updated"
      ? "Appointment updated successfully."
      : resolvedSearchParams?.success === "cancelled"
        ? "Appointment cancelled successfully."
        : resolvedSearchParams?.success
          ? "Appointment scheduled successfully."
          : null;

  return (
    <DashboardShell title="Appointments" subtitle="Today's session plan">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Upcoming" value={String(upcomingAppointments.length)} />
        <Card title="Completed" value={String(completedAppointments.length)} />
        <Card title="Total Visits" value={String(scopedAppointments.length)} />
      </div>
      <Card title="Schedule" className="overflow-hidden p-0">
        <table className="w-full table-auto text-sm">
          <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scopedAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{patientLookup[appointment.patientId]}</td>
                <td className="px-4 py-2">{new Date(appointment.scheduledAt).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{appointment.status}</td>
                <td className="px-4 py-2">{appointment.location}</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteAppointmentAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="redirectTo" value="/appointments" />
                    <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                      Cancel
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Reschedule or update">
        {scopedAppointments.length === 0 ? (
          <p className="text-sm text-slate-500">Schedule an appointment first to edit it.</p>
        ) : (
          <div className="space-y-4">
            {scopedAppointments.map((appointment) => (
              <details key={`${appointment.id}-edit`} className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                  <span>{patientLookup[appointment.patientId] ?? "Unknown patient"}</span>
                  <span className="text-xs text-slate-500">{new Date(appointment.scheduledAt).toLocaleString()}</span>
                </summary>
                <form action={updateAppointmentAction} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={appointment.id} />
                  <input type="hidden" name="patientId" value={appointment.patientId} />
                  <input type="hidden" name="redirectTo" value="/appointments" />
                  {role === "provider" ? <input type="hidden" name="providerId" value={userId ?? ""} /> : null}
                  {role !== "provider" ? <input type="hidden" name="providerId" value={appointment.providerId} /> : null}
                  <label className="text-sm font-medium text-slate-600">
                    Appointment date
                    <input
                      name="appointmentDate"
                      type="date"
                      defaultValue={getDateInputValue(appointment.scheduledAt)}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Time slot
                    <select
                      name="appointmentTime"
                      defaultValue={getTimeInputValue(appointment.scheduledAt)}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    >
                      {APPOINTMENT_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Duration
                    <input
                      name="durationMinutes"
                      type="number"
                      defaultValue={appointment.durationMinutes}
                      min={15}
                      max={180}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Location
                    <input
                      name="location"
                      defaultValue={appointment.location}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Status
                    <select
                      name="status"
                      defaultValue={appointment.status}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No show</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-600 md:col-span-2">
                    Notes
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={appointment.notes ?? ""}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full">
                      Save appointment
                    </Button>
                  </div>
                </form>
              </details>
            ))}
          </div>
        )}
      </Card>
      <Card title="Book appointment">
        <form action={createAppointmentAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="redirectTo" value="/appointments" />
          <label className="text-sm font-medium text-slate-600">
            Patient
            <select
              name="patientId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              defaultValue={scopedPatients[0]?.id ?? ""}
              disabled={scopedPatients.length === 0}
            >
              {scopedPatients.length === 0 ? (
                <option value="">No patients available</option>
              ) : (
                scopedPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))
              )}
            </select>
          </label>
          {role === "provider" ? <input type="hidden" name="providerId" value={userId ?? ""} /> : null}
          {role !== "provider" ? (
            <label className="text-sm font-medium text-slate-600">
              Provider ID
              <input
                name="providerId"
                required
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                placeholder="provider-001"
              />
            </label>
          ) : (
            <label className="text-sm font-medium text-slate-600">
              Provider
              <input
                value="Assigned to your account"
                disabled
                className="mt-1 w-full rounded-2xl border border-white/60 bg-slate-50 px-3 py-2 text-slate-500 shadow"
              />
            </label>
          )}
          <label className="text-sm font-medium text-slate-600">
            Appointment date
            <input
              name="appointmentDate"
              type="date"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Time slot
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
          <label className="text-sm font-medium text-slate-600">
            Duration (minutes)
            <input
              name="durationMinutes"
              type="number"
              defaultValue={50}
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Location
            <input
              name="location"
              defaultValue="Virtual"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Status
            <select
              name="status"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600 md:col-span-2">
            Notes
            <textarea
              name="notes"
              rows={3}
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Session focus"
            />
          </label>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Schedule
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
