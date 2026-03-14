import type { UserRole } from "@/types/auth";

export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  admin: "/dashboard",
  provider: "/dashboard",
  patient: "/portal",
};

export const getRedirectPathForRole = (role: UserRole) => ROLE_REDIRECT_MAP[role];

export const PROTECTED_ROUTE_ACCESS: { pattern: RegExp; allowed: UserRole[] }[] = [
  { pattern: /^\/dashboard(?:\/.*)?$/, allowed: ["admin", "provider"] },
  { pattern: /^\/patients(?:\/.*)?$/, allowed: ["admin", "provider"] },
  { pattern: /^\/appointments(?:\/.*)?$/, allowed: ["admin", "provider"] },
  { pattern: /^\/notes(?:\/.*)?$/, allowed: ["admin", "provider"] },
  { pattern: /^\/treatment-plans(?:\/.*)?$/, allowed: ["admin", "provider"] },
  { pattern: /^\/providers(?:\/.*)?$/, allowed: ["admin"] },
  { pattern: /^\/portal(?:\/.*)?$/, allowed: ["patient"] },
];

export const AUTH_PAGES = ["/login", "/signup"];

export const findAllowedRolesForPath = (pathname: string): UserRole[] | null => {
  const match = PROTECTED_ROUTE_ACCESS.find(({ pattern }) => pattern.test(pathname));
  return match?.allowed ?? null;
};
