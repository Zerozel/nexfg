// app/(auth)/super-admin/login/page.tsx
import { SuperAdminLoginForm } from "@/components/auth/SuperAdminLoginForm";

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <SuperAdminLoginForm />
    </div>
  );
}
