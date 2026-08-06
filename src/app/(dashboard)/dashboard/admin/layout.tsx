// app/(dashboard)/dashboard/admin/layout.tsx
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout allowedRoles={["admin", "principal"]}>
      {children}
    </DashboardLayout>
  );
}
