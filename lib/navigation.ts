import { CalendarCheck, FileText, Home, Users, ClipboardList, HeartPulse, Stethoscope } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, roles: ["admin", "provider"] },
  { label: "Patients", href: "/patients", icon: Users, roles: ["admin", "provider"] },
  { label: "Appointments", href: "/appointments", icon: CalendarCheck, roles: ["admin", "provider"] },
  { label: "Notes", href: "/notes", icon: FileText, roles: ["admin", "provider"] },
  { label: "Treatment Plans", href: "/treatment-plans", icon: ClipboardList, roles: ["admin", "provider"] },
  { label: "Providers", href: "/providers", icon: Stethoscope, roles: ["admin"] },
  { label: "Portal", href: "/portal", icon: HeartPulse, roles: ["patient"] },
];
