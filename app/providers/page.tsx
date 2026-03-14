import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProviders } from "@/lib/data/ehr";
import { PROVIDER_SPECIALTIES } from "@/lib/constants/providers";
import { createProviderAction, deleteProviderAction, updateProviderAction } from "./actions";

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

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD ?? "Welcome@123";
  const providers = await getProviders();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const providerPage = toPositivePage(resolvedSearchParams?.providerPage);
  const editProviderId = resolvedSearchParams?.editProvider;
  const errorMessage = resolvedSearchParams?.error ? decodeURIComponent(resolvedSearchParams.error) : null;
  const successMessage =
    resolvedSearchParams?.success === "credentials"
      ? `Provider saved and login created. Use the provider email and temporary password "${defaultUserPassword}".`
      : resolvedSearchParams?.success
        ? "Provider saved successfully."
        : null;
  const totalPages = Math.max(1, Math.ceil(providers.length / PAGE_SIZE));
  const currentPage = Math.min(providerPage, totalPages);
  const paginatedProviders = providers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <DashboardShell title="Providers" subtitle="Manage your clinical team and specialties">
      <Card title="Manage providers" className="overflow-hidden p-0">
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
            {paginatedProviders.map((provider) => (
              <>
                <tr key={provider.id} className="border-t border-slate-100">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-slate-900">{provider.fullName}</p>
                    <p className="text-sm text-slate-500">{provider.email}</p>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{provider.specialty ?? "Behavioral Health"}</td>
                  <td className="px-6 py-3 text-slate-500">{provider.phone ?? "N/A"}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="secondary" className="text-xs">
                        <Link
                          href={buildQueryString(resolvedSearchParams, {
                            editProvider: editProviderId === provider.id ? undefined : provider.id,
                            providerPage: String(currentPage),
                          })}
                        >
                          {editProviderId === provider.id ? "Close" : "Edit"}
                        </Link>
                      </Button>
                      <form action={deleteProviderAction}>
                        <input type="hidden" name="id" value={provider.id} />
                        <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
                {editProviderId === provider.id ? (
                  <tr className="border-t border-slate-100 bg-slate-50/60">
                    <td colSpan={4} className="px-6 py-5">
                      <form action={updateProviderAction} className="grid gap-3 md:grid-cols-2">
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
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
            {paginatedProviders.length === 0 && (
              <tr>
                <td className="px-6 py-4 text-sm text-slate-500" colSpan={4}>
                  No providers yet. Add your first team member below.
                </td>
              </tr>
            )}
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
                    providerPage: String(currentPage - 1),
                    editProvider: undefined,
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
                    providerPage: String(currentPage + 1),
                    editProvider: undefined,
                  })}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
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
