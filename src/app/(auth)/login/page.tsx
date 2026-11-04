// src/app/(auth)/login/page.tsx
import { LoginFormWrapper } from "@/components/auth/LoginFormWrapper";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <LoginFormWrapper />
    </div>
  );
}
