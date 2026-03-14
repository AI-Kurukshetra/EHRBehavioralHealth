import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAppointments, getPatients, getProviders, getTreatmentPlans } from "@/lib/data/ehr";
import { createPatientAction, deletePatientAction, updatePatientAction } from "./actions";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const [patients, appointments, plans, providers] = await Promise.all([
    getPatients(),
    getAppointments(),
    getTreatmentPlans(),
    getProviders(),
  ]);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error ? decodeURIComponent(resolvedSearchParams.error) : null;
  const successMessage =
    resolvedSearchParams?.success === "invited"
      ? "Patient saved and portal invite email sent."
      : resolvedSearchParams?.success
        ? "Patient saved successfully."
        : null;

  const latestVisits = appointments.reduce<Record<string, string>>((acc, appt) => {
    const current = acc[appt.patientId];
    if (!current || new Date(current) < new Date(appt.scheduledAt)) {
      acc[appt.patientId] = appt.scheduledAt;
    }
    return acc;
  }, {});

  return (
    <DashboardShell title="Patients" subtitle="Monitor caseload at a glance">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Active Patients" value={String(patients.filter((patient) => patient.status === "active").length)} />
        <Card title="Treatment Plans" value={String(plans.length)} />
        <Card title="Upcoming Visits" value={String(appointments.length)} />
      </div>
      <Card title="Caseload" className="overflow-hidden p-0">
        <table className="w-full table-auto text-sm">
          <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Last Visit</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t border-slate-100 text-slate-700">
                <td className="px-6 py-3">
                  <Link href={`/patients/${patient.id}`} className="font-medium text-slate-900">
                    {patient.fullName}
                  </Link>
                  <p className="text-xs text-slate-500">{patient.email}</p>
                </td>
                <td className="px-6 py-3 capitalize text-slate-500">{patient.status}</td>
                <td className="px-6 py-3 text-slate-500">
                  {latestVisits[patient.id] ? new Date(latestVisits[patient.id]).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-6 py-3 text-right">
                  <form action={deletePatientAction}>
                    <input type="hidden" name="id" value={patient.id} />
                    <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                      Remove
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Edit patients">
        {patients.length === 0 ? (
          <p className="text-sm text-slate-500">Add a patient first to edit their profile.</p>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => (
              <details key={`${patient.id}-edit`} className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                  {patient.fullName}
                  <span className="text-xs text-slate-500">Click to edit</span>
                </summary>
                <form action={updatePatientAction} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={patient.id} />
                  <label className="text-sm font-medium text-slate-600">
                    Full name
                    <input
                      name="fullName"
                      defaultValue={patient.fullName}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Email
                    <input
                      name="email"
                      type="email"
                      defaultValue={patient.email}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Phone
                    <input
                      name="phone"
                      defaultValue={patient.phone ?? ""}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Date of birth
                    <input
                      name="dateOfBirth"
                      type="date"
                      defaultValue={patient.dateOfBirth ?? ""}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Provider
                    <select
                      name="providerId"
                      defaultValue={patient.providerId}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                      required
                    >
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Status
                    <select
                      name="status"
                      defaultValue={patient.status}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full">
                      Save changes
                    </Button>
                  </div>
                </form>
              </details>
            ))}
          </div>
        )}
      </Card>
      <Card title="Add patient">
        {errorMessage ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
        ) : null}
        {successMessage ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        <form action={createPatientAction} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Full name
            <input
              name="fullName"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Jordan Diaz"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Email
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="jordan@example.com"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Phone
            <input
              name="phone"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="(555) 123-4455"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Date of birth
            <input
              name="dateOfBirth"
              type="date"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Provider
            <select
              name="providerId"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              required
              defaultValue={providers[0]?.id ?? ""}
              disabled={providers.length === 0}
            >
              {providers.length === 0 ? (
                <option value="">No providers available</option>
              ) : (
                providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.fullName}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Status
            <select
              name="status"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <input type="checkbox" name="createAccount" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            <span>Send portal invite email and create patient login account</span>
          </label>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Save patient
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
