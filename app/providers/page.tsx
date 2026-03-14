import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProviders } from "@/lib/data/ehr";
import { PROVIDER_SPECIALTIES } from "@/lib/constants/providers";
import { createProviderAction, deleteProviderAction, updateProviderAction } from "./actions";

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD ?? "Welcome@123";
  const providers = await getProviders();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error ? decodeURIComponent(resolvedSearchParams.error) : null;
  const successMessage =
    resolvedSearchParams?.success === "credentials"
      ? `Provider saved and login created. Use the provider email and temporary password "${defaultUserPassword}".`
      : resolvedSearchParams?.success
        ? "Provider saved successfully."
        : null;

  return (
    <DashboardShell title="Providers" subtitle="Manage your clinical team and specialties">
      <Card title="Team Roster" className="overflow-hidden p-0">
        <table className="w-full table-auto text-sm">
          <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Specialty</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="border-t border-slate-100">
                <td className="px-6 py-3">
                  <p className="font-semibold text-slate-900">{provider.fullName}</p>
                  <p className="text-sm text-slate-500">{provider.email}</p>
                </td>
                <td className="px-6 py-3 text-slate-500">{provider.specialty ?? "Behavioral Health"}</td>
                <td className="px-6 py-3 text-slate-500">{provider.phone ?? "N/A"}</td>
                <td className="px-6 py-3 text-right">
                  <form action={deleteProviderAction}>
                    <input type="hidden" name="id" value={provider.id} />
                    <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                      Remove
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td className="px-6 py-4 text-sm text-slate-500" colSpan={4}>
                  No providers yet. Add your first team member below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Card title="Edit providers">
        {providers.length === 0 ? (
          <p className="text-sm text-slate-500">Add a provider first to edit their profile.</p>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <details key={`${provider.id}-edit`} className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                  {provider.fullName}
                  <span className="text-xs text-slate-500">Click to edit</span>
                </summary>
                <form action={updateProviderAction} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={provider.id} />
                  <label className="text-sm font-medium text-slate-600">
                    Full name
                    <input
                      name="fullName"
                      defaultValue={provider.fullName}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Email
                    <input
                      name="email"
                      type="email"
                      defaultValue={provider.email}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Phone
                    <input
                      name="phone"
                      defaultValue={provider.phone ?? ""}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Specialty
                    <select
                      name="specialty"
                      defaultValue={provider.specialty ?? PROVIDER_SPECIALTIES[0]}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    >
                      {PROVIDER_SPECIALTIES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
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
      <Card title="Add provider">
        {errorMessage ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
        ) : null}
        {successMessage ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        <form action={createProviderAction} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Full name
            <input
              name="fullName"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Dr. Priya Patel"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="provider@example.com"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Phone
            <input
              name="phone"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="(555) 555-5555"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Specialty
            <select
              name="specialty"
              defaultValue={PROVIDER_SPECIALTIES[0]}
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            >
              {PROVIDER_SPECIALTIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <input type="checkbox" name="createAccount" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            <span>Create provider login account with a temporary password</span>
          </label>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Save provider
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
