// src/components/auth/LoginFormWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(
  () => import("@/components/auth/LoginForm").then((mod) => mod.LoginForm),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md h-[500px] bg-white/50 rounded-xl shadow-lg animate-pulse" />
    ),
  }
);

export function LoginFormWrapper() {
  return <LoginForm />;
}
