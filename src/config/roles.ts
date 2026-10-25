// config/roles.ts

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
  School,
  Headphones,
  Mail,
  MessageCircle,
  Megaphone,
  Ticket,
  Layers,
  type LucideIcon,
} from "lucide-react";

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

// Helper type used by the nav arrays — same as NavItem but icon is required,
// so a missing icon is caught at compile time in these definitions.
type NavItemWithIcon = NavItem & { icon: LucideIcon };

export const TEACHER_NAV: NavItemWithIcon[] = [
  {
    label: "My Classes",
    href: "/dashboard/teacher",
    roles: ["teacher"],
    icon: GraduationCap,
  },
  {
    label: "Manage Subjects",
    href: "/dashboard/teacher/subjects",
    roles: ["teacher"],
    icon: BookOpen,
  },
];

export const ADMIN_NAV: NavItemWithIcon[] = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    roles: ["admin", "principal"],
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: "/dashboard/admin/students",
    roles: ["admin", "principal"],
    icon: Users,
  },
  {
    label: "Teachers",
    href: "/dashboard/admin/teachers",
    roles: ["admin", "principal"],
    icon: GraduationCap,
  },
  {
    label: "Classes",
    href: "/dashboard/admin/classes",
    roles: ["admin", "principal"],
    icon: Layers,
  },
  {
    label: "Subject Assignment",
    href: "/dashboard/admin/subject-assignment",
    roles: ["admin", "principal"],
    icon: BookOpen,
  },
  {
    label: "Subjects",
    href: "/dashboard/admin/subjects",
    roles: ["admin", "principal"],
    icon: ClipboardList,
  },
  {
    label: "Assessments",
    href: "/dashboard/admin/assessments",
    roles: ["admin", "principal"],
    icon: ClipboardList,
  },
  {
    label: "Compile Results",
    href: "/dashboard/admin/compile",
    roles: ["admin", "principal"],
    icon: FileSpreadsheet,
  },
  {
    label: "Score Sheets",
    href: "/dashboard/admin/score-sheets",
    roles: ["admin", "principal"],
    icon: FileText,
  },
  {
    label: "Reports",
    href: "/dashboard/admin/reports",
    roles: ["admin", "principal"],
    icon: FileText,
  },
  {
    label: "Messages",
    href: "/dashboard/admin/messages",
    roles: ["admin", "principal"],
    icon: MessageSquare,
  },
  {
    label: "Billing",
    href: "/dashboard/admin/billing",
    roles: ["admin", "principal"],
    icon: CreditCard,
  },
  {
    label: "School Settings",
    href: "/dashboard/admin/school-settings",
    roles: ["admin", "principal"],
    icon: Settings,
  },
];

export const SUPER_ADMIN_NAV: NavItemWithIcon[] = [
  {
    label: "Dashboard",
    href: "/dashboard/super-admin",
    roles: ["super_admin"],
    icon: LayoutDashboard,
  },
  {
    label: "Schools",
    href: "/dashboard/super-admin/schools",
    roles: ["super_admin"],
    icon: School,
  },
  {
    label: "Support Chats",
    href: "/dashboard/super-admin/support",
    roles: ["super_admin"],
    icon: Headphones,
  },
  {
    label: "School Messages",
    href: "/dashboard/super-admin/school-messages",
    roles: ["super_admin"],
    icon: Mail,
  },
  {
    label: "Feedback",
    href: "/dashboard/super-admin/feedback",
    roles: ["super_admin"],
    icon: MessageCircle,
  },
  {
    label: "Broadcasts",
    href: "/dashboard/super-admin/broadcasts",
    roles: ["super_admin"],
    icon: Megaphone,
  },
  {
    label: "Promo Codes",
    href: "/dashboard/super-admin/promo-codes",
    roles: ["super_admin"],
    icon: Ticket,
  },
];

export function getNavForRole(role: UserRole): NavItemWithIcon[] {
  if (role === "super_admin") return SUPER_ADMIN_NAV;
  if (role === "teacher") return TEACHER_NAV;
  return ADMIN_NAV;
}
