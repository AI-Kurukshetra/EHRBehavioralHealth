import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAppointments, getCurrentUserContext, getPatients, getProviders, getTreatmentPlans, scopePatientsToCurrentProvider, scopeRecordsToCurrentProvider } from "@/lib/data/ehr";
import { createPatientAction, deletePatientAction, updatePatientAction } from "./actions";

const PAGE_SIZE = 5;

const toPositivePage = (value: string | undefined) => {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const buildQueryString = (
  searchParams: Record<string, string | undefined> | undefined,
  updates: Record<string, string | undefined>
) => {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { role, userId } = await getCurrentUserContext();
  const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD ?? "Welcome@123";
  const [patients, appointments, plans, providers] = await Promise.all([
    getPatients(),
    getAppointments(),
    getTreatmentPlans(),
    getProviders(),
  ]);
  const scopedPatients = await scopePatientsToCurrentProvider(patients);
  const scopedAppointments = await scopeRecordsToCurrentProvider(appointments);
  const scopedPlans = await scopeRecordsToCurrentProvider(plans);
  const availableProviders = role === "provider" && userId ? providers.filter((provider) => provider.id === userId) : providers;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const patientPage = toPositivePage(resolvedSearchParams?.patientPage);
  const editPatientId = resolvedSearchParams?.editPatient;
  const errorMessage = resolvedSearchParams?.error ? decodeURIComponent(resolvedSearchParams.error) : null;
  const successMessage =
    resolvedSearchParams?.success === "credentials"
      ? `Patient saved and login created. Use the patient email and temporary password "${defaultUserPassword}".`
      : resolvedSearchParams?.success
        ? "Patient saved successfully."
        : null;

  const latestVisits = scopedAppointments.reduce<Record<string, string>>((acc, appt) => {
    const current = acc[appt.patientId];
    if (!current || new Date(current) < new Date(appt.scheduledAt)) {
      acc[appt.patientId] = appt.scheduledAt;
    }
    return acc;
  }, {});
  const totalPages = Math.max(1, Math.ceil(scopedPatients.length / PAGE_SIZE));
  const currentPage = Math.min(patientPage, totalPages);
  const paginatedPatients = scopedPatients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <DashboardShell title="Patients" subtitle="Monitor caseload at a glance">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Active Patients" value={String(scopedPatients.filter((patient) => patient.status === "active").length)} />
        <Card title="Treatment Plans" value={String(scopedPlans.length)} />
        <Card title="Upcoming Visits" value={String(scopedAppointments.length)} />
      </div>
      <Card title="Manage patients" className="overflow-hidden p-0">
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
            {paginatedPatients.map((patient) => (
              <>
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
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="secondary" className="text-xs">
                        <Link
                          href={buildQueryString(resolvedSearchParams, {
                            editPatient: editPatientId === patient.id ? undefined : patient.id,
                            patientPage: String(currentPage),
                          })}
                        >
                          {editPatientId === patient.id ? "Close" : "Edit"}
                        </Link>
                      </Button>
                      <form action={deletePatientAction}>
                        <input type="hidden" name="id" value={patient.id} />
                        <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
                {editPatientId === patient.id ? (
                  <tr className="border-t border-slate-100 bg-slate-50/60">
                    <td colSpan={4} className="px-6 py-5">
                      <form action={updatePatientAction} className="grid gap-3 md:grid-cols-2">
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
                        {role === "provider" ? (
                          <label className="text-sm font-medium text-slate-600">
                            Assigned provider
                            <input
                              value={availableProviders[0]?.fullName ?? "Current provider"}
                              disabled
                              className="mt-1 w-full rounded-2xl border border-white/60 bg-slate-50 px-3 py-2 text-slate-500 shadow"
                            />
                            <input type="hidden" name="providerId" value={userId ?? patient.providerId} />
                          </label>
                        ) : (
                          <label className="text-sm font-medium text-slate-600">
                            Provider
                            <select
                              name="providerId"
                              defaultValue={patient.providerId}
                              className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                              required
                            >
                              {availableProviders.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                  {provider.fullName}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
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
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm text-slate-500">
                  No patients yet. Add your first patient below.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm">
          <p className="text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage <= 1 ? (
              <Button variant="secondary" className="text-xs" disabled>
                Previous
              </Button>
            ) : (
              <Button asChild variant="secondary" className="text-xs">
                <Link
                  href={buildQueryString(resolvedSearchParams, {
                    patientPage: String(currentPage - 1),
                    editPatient: undefined,
                  })}
                >
                  Previous
                </Link>
              </Button>
            )}
            {currentPage >= totalPages ? (
              <Button variant="secondary" className="text-xs" disabled>
                Next
              </Button>
            ) : (
              <Button asChild variant="secondary" className="text-xs">
                <Link
                  href={buildQueryString(resolvedSearchParams, {
                    patientPage: String(currentPage + 1),
                    editPatient: undefined,
                  })}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
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
            {role === "provider" ? (
              <>
                <input type="hidden" name="providerId" value={userId ?? ""} />
                <input
                  value={availableProviders[0]?.fullName ?? "Current provider"}
                  disabled
                  className="mt-1 w-full rounded-2xl border border-white/60 bg-slate-50 px-3 py-2 text-slate-500 shadow"
                />
              </>
            ) : (
              <select
                name="providerId"
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                required
                defaultValue={availableProviders[0]?.id ?? ""}
                disabled={availableProviders.length === 0}
              >
                {availableProviders.length === 0 ? (
                  <option value="">No providers available</option>
                ) : (
                  availableProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.fullName}
                    </option>
                  ))
                )}
              </select>
            )}
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
            <span>Create patient login account with a temporary password</span>
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
