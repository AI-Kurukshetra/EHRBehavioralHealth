"use client";

import Link from "next/link";
import clsx from "clsx";
import { useNavigation } from "@/hooks/useNavigation";

interface SidebarNavProps {
  variant?: "desktop" | "mobile";
}

export function SidebarNav({ variant = "desktop" }: SidebarNavProps) {
  const items = useNavigation();

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
            item.isActive
              ? variant === "desktop"
                ? "bg-linear-to-r from-indigo-500/14 to-sky-400/18 text-slate-900 shadow-sm ring-1 ring-indigo-100"
                : "bg-linear-to-r from-indigo-500/20 to-sky-400/20 text-slate-900 shadow-sm"
              : variant === "desktop"
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                : "text-slate-500 hover:bg-white/70"
          )}
        >
          <item.icon className={clsx("h-4 w-4", variant === "desktop" ? "text-slate-400" : undefined)} aria-hidden />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
