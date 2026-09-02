// app/(dashboard)/dashboard/super-admin/layout.tsx
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      {children}
    </AuthGuard>
  );
}