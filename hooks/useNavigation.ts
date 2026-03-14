"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import type { UserRole } from "@/types/auth";

const getRoleFromDocument = (): UserRole => {
  if (typeof document === "undefined") {
    return "provider";
  }
  const cookie = document.cookie?.split(";").find((entry) => entry.trim().startsWith("bh_role="));
  const value = cookie?.split("=")[1];
  if (!value) {
    return "provider";
  }
  return decodeURIComponent(value) as UserRole;
};

export const useNavigation = () => {
  const pathname = usePathname();
  const [role] = useState<UserRole>(() => getRoleFromDocument());

  return NAVIGATION_ITEMS.filter((item) => item.roles.includes(role)).map((item) => ({
    ...item,
    isActive: pathname === item.href,
  }));
};
