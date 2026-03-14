import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAppointments, getPatients } from "@/lib/data/ehr";
import { createAppointmentAction, deleteAppointmentAction } from "./actions";

export default async function AppointmentsPage() {
  const [appointments, patients] = await Promise.all([getAppointments(), getPatients()]);
  const patientLookup = Object.fromEntries(patients.map((patient) => [patient.id, patient.fullName]));

  return (
    <DashboardShell title="Appointments" subtitle="Today's session plan">
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
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{patientLookup[appointment.patientId]}</td>
                <td className="px-4 py-2">{new Date(appointment.scheduledAt).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{appointment.status}</td>
                <td className="px-4 py-2">{appointment.location}</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteAppointmentAction}>
                    <input type="hidden" name="id" value={appointment.id} />
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
      <Card title="Book appointment">
        <form action={createAppointmentAction} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Patient ID
            <input
              name="patientId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="patient-001"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Provider ID
            <input
              name="providerId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="provider-001"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Scheduled at
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            />
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
