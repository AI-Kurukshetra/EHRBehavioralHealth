import type { LucideIcon } from "lucide-react";

import type { UserRole } from "@/types/auth";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  roles: UserRole[];
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};
