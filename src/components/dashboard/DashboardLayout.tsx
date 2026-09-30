"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BroadcastBanner } from "@/components/support/BroadcastBanner";
import { SupportWidget } from "@/components/support/SupportWidget";
import { TeacherWidget } from "@/components/support/TeacherWidget";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function DashboardLayout({
  children,
  allowedRoles,
}: DashboardLayoutProps) {
  const { role } = useAuth();

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <BroadcastBanner />
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>

      {/* Role-scoped floating widget */}
      {(role === "admin" || role === "principal") && <SupportWidget />}
      {role === "teacher" && <TeacherWidget />}
    </AuthGuard>
  );
}
