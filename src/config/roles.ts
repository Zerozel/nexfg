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
  ArrowRightLeft,
  CalendarClock,
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

// ─── Nav types ─────────────────────────────────────────────────────────────

export type NavItemWithIcon = NavItem & { icon: LucideIcon };

// A group of related nav items. Rendered as a collapsible section.
export interface NavGroupWithIcon {
  label: string;
  icon: LucideIcon;
  items: NavItemWithIcon[];
}

// A sidebar section = either a single primary item, or a group of items.
export type SidebarSection =
  | { type: "item"; item: NavItemWithIcon }
  | { type: "group"; group: NavGroupWithIcon };

// ─── Teacher nav (flat, small) ─────────────────────────────────────────────

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

// ─── Admin nav (grouped) ───────────────────────────────────────────────────

const adminPrimary: NavItemWithIcon[] = [
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
    label: "Staff",
    href: "/dashboard/admin/teachers",
    roles: ["admin", "principal"],
    icon: GraduationCap,
  },
];

const adminAcademicGroup: NavGroupWithIcon = {
  label: "Academic",
  icon: BookOpen,
  items: [
    {
      label: "Classes",
      href: "/dashboard/admin/classes",
      roles: ["admin", "principal"],
      icon: Layers,
    },
    {
      label: "Subjects",
      href: "/dashboard/admin/subjects",
      roles: ["admin", "principal"],
      icon: ClipboardList,
    },
    {
      label: "Subject Assignment",
      href: "/dashboard/admin/subject-assignment",
      roles: ["admin", "principal"],
      icon: BookOpen,
    },
    {
      label: "Assessments",
      href: "/dashboard/admin/assessments",
      roles: ["admin", "principal"],
      icon: ClipboardList,
    },
  ],
};

const adminResultsGroup: NavGroupWithIcon = {
  label: "Results",
  icon: FileSpreadsheet,
  items: [
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
  ],
};

const adminTermGroup: NavGroupWithIcon = {
  label: "Term",
  icon: CalendarClock,
  items: [
    {
      label: "Sessions",
      href: "/dashboard/admin/sessions",
      roles: ["admin", "principal"],
      icon: CalendarClock,
    },
    {
      label: "Promotions",
      href: "/dashboard/admin/promotions",
      roles: ["admin", "principal"],
      icon: ArrowRightLeft,
    },
  ],
};

const adminOpsGroup: NavGroupWithIcon = {
  label: "Operations",
  icon: Settings,
  items: [
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
  ],
};

export const ADMIN_SECTIONS: SidebarSection[] = [
  ...adminPrimary.map((item) => ({ type: "item" as const, item })),
  { type: "group", group: adminAcademicGroup },
  { type: "group", group: adminResultsGroup },
  { type: "group", group: adminTermGroup },
  { type: "group", group: adminOpsGroup },
];

// Backwards-compatible flat list (used by any code that still expects it).
export const ADMIN_NAV: NavItemWithIcon[] = [
  ...adminPrimary,
  ...adminAcademicGroup.items,
  ...adminResultsGroup.items,
  ...adminTermGroup.items,
  ...adminOpsGroup.items,
];

// ─── Super admin nav (grouped) ─────────────────────────────────────────────

const superAdminPrimary: NavItemWithIcon[] = [
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
];

const superAdminEngagementGroup: NavGroupWithIcon = {
  label: "Engagement",
  icon: MessageCircle,
  items: [
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
  ],
};

const superAdminGrowthGroup: NavGroupWithIcon = {
  label: "Growth",
  icon: Ticket,
  items: [
    {
      label: "Promo Codes",
      href: "/dashboard/super-admin/promo-codes",
      roles: ["super_admin"],
      icon: Ticket,
    },
  ],
};

export const SUPER_ADMIN_SECTIONS: SidebarSection[] = [
  ...superAdminPrimary.map((item) => ({ type: "item" as const, item })),
  { type: "group", group: superAdminEngagementGroup },
  { type: "group", group: superAdminGrowthGroup },
];

// Backwards-compatible flat list
export const SUPER_ADMIN_NAV: NavItemWithIcon[] = [
  ...superAdminPrimary,
  ...superAdminEngagementGroup.items,
  ...superAdminGrowthGroup.items,
];

// ─── Resolvers ─────────────────────────────────────────────────────────────

export function getNavForRole(role: UserRole): NavItemWithIcon[] {
  if (role === "super_admin") return SUPER_ADMIN_NAV;
  if (role === "teacher") return TEACHER_NAV;
  return ADMIN_NAV;
}

export function getSectionsForRole(role: UserRole): SidebarSection[] {
  if (role === "super_admin") return SUPER_ADMIN_SECTIONS;
  if (role === "admin" || role === "principal") return ADMIN_SECTIONS;
  // Teacher — wrap each item as its own top-level entry
  return TEACHER_NAV.map((item) => ({ type: "item" as const, item }));
}
