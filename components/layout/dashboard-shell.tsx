import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { AppHeader } from "@/components/layout/app-header";
import { signOut } from "@/app/actions/logout";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export async function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  const cookieStore = await cookies();
  const displayName = decodeURIComponent(cookieStore.get("bh_full_name")?.value ?? "Team Member");
  const role = (cookieStore.get("bh_role")?.value as UserRole | undefined) ?? "provider";

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,.15),transparent_45%),radial-gradient(circle_at_70%_20%,rgba(99,102,241,.15),transparent_40%)]">
      <div className="grid h-full gap-0 lg:grid-cols-[290px_1fr]">
        <aside className="hidden h-screen overflow-y-auto border-r border-slate-200/80 bg-white/88 px-5 py-6 backdrop-blur-xl lg:block">
          <div className="flex h-full flex-col">
            <div className="space-y-6">
              <div className="space-y-4 px-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-sky-400 text-sm font-bold tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(79,70,229,0.22)]">
                    BH
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">BehavioralHealth</p>
                    <p className="text-lg font-semibold tracking-tight text-slate-900">EHR Platform</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</p>
                    <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                      {role}
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{displayName}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Navigation</p>
                <SidebarNav variant="desktop" />
              </div>
            </div>
            <form action={signOut} className="mt-auto pt-6">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
              >
                Sign out
              </Button>
            </form>
          </div>
        </aside>
        <div className="flex h-screen flex-col overflow-y-auto">
          <AppHeader title={title} subtitle={subtitle} />
          <div className="border-y border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur lg:hidden">
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{displayName}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
              <SidebarNav variant="mobile" />
              <form action={signOut}>
                <Button type="submit" variant="ghost" className="w-full justify-start rounded-2xl border border-slate-200 bg-white px-4 py-3 text-rose-600 hover:text-rose-700">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
          <main className="flex-1 px-6 py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
