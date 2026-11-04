// src/app/(auth)/login/page.tsx
import dynamic from "next/dynamic";

// Load the LoginForm only on the client side to prevent hydration mismatches
// during soft navigation from the landing page.
const LoginForm = dynamic(
  () => import("@/components/auth/LoginForm").then((mod) => mod.LoginForm),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md h-[500px] bg-white/50 rounded-xl shadow-lg animate-pulse" />
    )
  }
);

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <LoginForm />
    </div>
  );
}
