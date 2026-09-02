// config/roles.ts

import { UserRole, NavItem } from "@/types";

export const ROLES = {
  SUPER_ADMIN: "super_admin" as UserRole,
  ADMIN: "admin" as UserRole,
  PRINCIPAL: "principal" as UserRole,
  TEACHER: "teacher" as UserRole,
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  principal: "Principal",
  teacher: "Teacher",
};

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  super_admin: "/dashboard/super-admin",
  admin: "/dashboard/admin",
  principal: "/dashboard/admin",
  teacher: "/dashboard/teacher",
};

export function getDashboardRoute(role: UserRole): string {
  return ROLE_DASHBOARD_ROUTES[role] || "/login";
}

export const TEACHER_NAV: NavItem[] = [
  { label: "My Classes", href: "/dashboard/teacher", roles: ["teacher"] },
  {
    label: "Enter Scores",
    href: "/dashboard/teacher/scores",
    roles: ["teacher"],
  },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", roles: ["admin", "principal"] },
  { label: "Students", href: "/dashboard/admin/students", roles: ["admin", "principal"] },
  { label: "Teachers", href: "/dashboard/admin/teachers", roles: ["admin", "principal"] },
  { label: "Classes", href: "/dashboard/admin/classes", roles: ["admin", "principal"] },
  { label: "Subjects", href: "/dashboard/admin/subjects", roles: ["admin", "principal"] },
  { label: "Assessments", href: "/dashboard/admin/assessments", roles: ["admin", "principal"] },
  { label: "School Website", href: "/dashboard/admin/website", roles: ["admin", "principal"] },
  { label: "Billing", href: "/dashboard/admin/billing", roles: ["admin", "principal"] },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/super-admin", roles: ["super_admin"] },
  { label: "Schools", href: "/dashboard/super-admin/schools", roles: ["super_admin"] },
  //{ label: "System Settings", href: "/dashboard/super-admin/settings", roles: ["super_admin"] },
];

export function getNavForRole(role: UserRole): NavItem[] {
  if (role === "super_admin") return SUPER_ADMIN_NAV;
  if (role === "teacher") return TEACHER_NAV;
  return ADMIN_NAV;
}
