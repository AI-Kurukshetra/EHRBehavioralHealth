import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPatients, getTreatmentPlans } from "@/lib/data/ehr";
import { createTreatmentPlanAction, deleteTreatmentPlanAction } from "./actions";

export default async function TreatmentPlansPage() {
  const [plans, patients] = await Promise.all([getTreatmentPlans(), getPatients()]);
  const patientLookup = Object.fromEntries(patients.map((patient) => [patient.id, patient.fullName]));

  return (
    <DashboardShell title="Treatment Plans" subtitle="Active plans and goals">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Active" value={String(plans.filter((plan) => plan.status === "active").length)} />
        <Card title="Paused" value={String(plans.filter((plan) => plan.status === "paused").length)} />
        <Card title="Completed" value={String(plans.filter((plan) => plan.status === "completed").length)} />
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
            {plans.map((plan) => (
              <tr key={plan.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{patientLookup[plan.patientId]}</td>
                <td className="px-4 py-2 font-medium">{plan.title}</td>
                <td className="px-4 py-2 capitalize">{plan.status}</td>
                <td className="px-4 py-2">{plan.reviewDate ? new Date(plan.reviewDate).toLocaleDateString() : "TBD"}</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteTreatmentPlanAction}>
                    <input type="hidden" name="id" value={plan.id} />
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
      <Card title="Create plan">
        <form action={createTreatmentPlanAction} className="grid gap-3 md:grid-cols-2">
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
