// app/(dashboard)/dashboard/super-admin/layout.tsx
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout allowedRoles={["super_admin"]}>
      {children}
    </DashboardLayout>
  );
}
