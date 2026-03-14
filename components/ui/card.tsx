import type { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  title: string;
  value?: string;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, value, children, className }: CardProps) {
  return (
    <section className={clsx("gradient-border", className)}>
      <div className="gradient-border-inner relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
          {value ? <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p> : null}
          {children ? <div className="mt-4 text-sm text-slate-600">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
