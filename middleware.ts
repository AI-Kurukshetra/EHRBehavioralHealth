import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { findAllowedRolesForPath, getRedirectPathForRole, AUTH_PAGES } from "@/lib/auth";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/auth";

const { NEXT_PUBLIC_SUPABASE_URL = "", NEXT_PUBLIC_SUPABASE_ANON_KEY = "" } = process.env;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const errorParam = req.nextUrl.searchParams.get("error");
  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => req.cookies.get(name)?.value,
      set: (name, value, options) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name, options) => {
        res.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedRoles = findAllowedRolesForPath(pathname);

  if (!user) {
    if (allowedRoles) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    if (AUTH_PAGES.includes(pathname) && errorParam === "profile") {
      return res;
    }

    const response = NextResponse.redirect(new URL("/login?error=profile", req.url));
    response.cookies.set({ name: "bh_role", value: "", path: "/", maxAge: 0 });
    response.cookies.set({ name: "bh_full_name", value: "", path: "/", maxAge: 0 });
    response.cookies.set({ name: "bh_user_id", value: "", path: "/", maxAge: 0 });
    return response;
  }

  const role = profile.role as UserRole;
  const fullName = profile.full_name ?? user.email ?? "Team Member";

  res.cookies.set({
    name: "bh_role",
    value: role,
    path: "/",
    sameSite: "lax",
  });

  res.cookies.set({
    name: "bh_full_name",
    value: encodeURIComponent(fullName),
    path: "/",
    sameSite: "lax",
  });

  res.cookies.set({
    name: "bh_user_id",
    value: user.id,
    path: "/",
    sameSite: "lax",
  });

  if (AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(getRedirectPathForRole(role), req.url));
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL(getRedirectPathForRole(role), req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/appointments/:path*",
    "/notes/:path*",
    "/portal/:path*",
    "/treatment-plans/:path*",
    "/providers/:path*",
    "/login",
    "/signup",
  ],
};
