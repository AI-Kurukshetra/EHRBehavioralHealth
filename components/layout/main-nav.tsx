import Link from "next/link";
import { cookies } from "next/headers";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import type { UserRole } from "@/types/auth";

export async function MainNav() {
  const cookieStore = await cookies();
  const role = (cookieStore.get("bh_role")?.value as UserRole | undefined) ?? "provider";
  const items = NAVIGATION_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
