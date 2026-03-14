import clsx from "clsx";
import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";

const baseStyles =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70";

const variants = {
  primary:
    "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200 hover:brightness-105 focus-visible:outline-indigo-500",
  secondary:
    "bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300 focus-visible:outline-slate-400",
  ghost: "bg-transparent text-slate-600 hover:text-indigo-600 focus-visible:outline-indigo-500",
  destructive:
    "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:brightness-105 focus-visible:outline-rose-500",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof typeof variants;
};

export function Button({ asChild = false, className, variant = "primary", children, ...props }: ButtonProps) {
  const buttonClassName = clsx(baseStyles, variants[variant], className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;

    return cloneElement(child, {
      ...props,
      className: clsx(buttonClassName, child.props.className),
    });
  }

  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
}
