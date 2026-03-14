import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getCurrentUserContext,
  getPatients,
  getProviders,
  getTreatmentPlans,
  scopePatientsToCurrentProvider,
  scopeRecordsToCurrentProvider,
} from "@/lib/data/ehr";
import { createTreatmentPlanAction, deleteTreatmentPlanAction, updateTreatmentPlanAction } from "./actions";

export default async function TreatmentPlansPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { role, userId } = await getCurrentUserContext();
  const [plans, patients, providers] = await Promise.all([getTreatmentPlans(), getPatients(), getProviders()]);
  const scopedPlans = await scopeRecordsToCurrentProvider(plans);
  const scopedPatients = await scopePatientsToCurrentProvider(patients);
  const availableProviders = role === "provider" && userId ? providers.filter((provider) => provider.id === userId) : providers;
  const patientLookup = Object.fromEntries(scopedPatients.map((patient) => [patient.id, patient.fullName]));
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error ? decodeURIComponent(resolvedSearchParams.error) : null;
  const successMessage =
    resolvedSearchParams?.success === "updated"
      ? "Treatment plan updated successfully."
      : resolvedSearchParams?.success === "deleted"
        ? "Treatment plan archived successfully."
        : resolvedSearchParams?.success
          ? "Treatment plan saved successfully."
          : null;

  return (
    <DashboardShell title="Treatment Plans" subtitle="Active plans and goals">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Active" value={String(scopedPlans.filter((plan) => plan.status === "active").length)} />
        <Card title="Paused" value={String(scopedPlans.filter((plan) => plan.status === "paused").length)} />
        <Card title="Completed" value={String(scopedPlans.filter((plan) => plan.status === "completed").length)} />
      </div>
      <Card title="Plans" className="overflow-hidden p-0">
        <table className="w-full table-auto text-sm">
          <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Review</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scopedPlans.map((plan) => (
              <tr key={plan.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{patientLookup[plan.patientId]}</td>
                <td className="px-4 py-2 font-medium">{plan.title}</td>
                <td className="px-4 py-2 capitalize">{plan.status}</td>
                <td className="px-4 py-2">{plan.reviewDate ? new Date(plan.reviewDate).toLocaleDateString() : "TBD"}</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteTreatmentPlanAction}>
                    <input type="hidden" name="id" value={plan.id} />
                    <input type="hidden" name="redirectTo" value="/treatment-plans" />
                    <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                      Archive
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Update plan">
        {scopedPlans.length === 0 ? (
          <p className="text-sm text-slate-500">Create a treatment plan first to update goals or status.</p>
        ) : (
          <div className="space-y-4">
            {scopedPlans.map((plan) => (
              <details key={`${plan.id}-edit`} className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                  <span>{plan.title}</span>
                  <span className="text-xs text-slate-500">{patientLookup[plan.patientId] ?? "Unknown patient"}</span>
                </summary>
                <form action={updateTreatmentPlanAction} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={plan.id} />
                  <input type="hidden" name="patientId" value={plan.patientId} />
                  <input type="hidden" name="redirectTo" value="/treatment-plans" />
                  {role === "provider" ? <input type="hidden" name="providerId" value={userId ?? ""} /> : null}
                  {role !== "provider" ? (
                    <label className="text-sm font-medium text-slate-600">
                      Provider
                      <select
                        name="providerId"
                        defaultValue={plan.providerId}
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
                  ) : null}
                  <label className="text-sm font-medium text-slate-600">
                    Title
                    <input
                      name="title"
                      defaultValue={plan.title}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Status
                    <select
                      name="status"
                      defaultValue={plan.status}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-600 md:col-span-2">
                    Goals
                    <textarea
                      name="goals"
                      rows={2}
                      defaultValue={plan.goals}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600 md:col-span-2">
                    Interventions
                    <textarea
                      name="interventions"
                      rows={2}
                      defaultValue={plan.interventions}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Review date
                    <input
                      name="reviewDate"
                      type="date"
                      defaultValue={plan.reviewDate ?? ""}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full">
                      Save plan updates
                    </Button>
                  </div>
                </form>
              </details>
            ))}
          </div>
        )}
      </Card>
      <Card title="Create plan">
        <form action={createTreatmentPlanAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="redirectTo" value="/treatment-plans" />
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
              Provider
              <select
                name="providerId"
                required
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
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
            Title
            <input
              name="title"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="CBT pathway"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Status
            <select
              name="status"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600 md:col-span-2">
            Goals
            <textarea
              name="goals"
              rows={2}
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Reduce PHQ-9 score"
            />
          </label>
          <label className="text-sm font-medium text-slate-600 md:col-span-2">
            Interventions
            <textarea
              name="interventions"
              rows={2}
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Weekly CBT, mindfulness"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Review date
            <input
              name="reviewDate"
              type="date"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Save plan
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
