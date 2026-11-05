// src/components/auth/LoginFormWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export function LoginFormWrapper() {
  const [mounted, setMounted] = useState(false);

  // Wait until the component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // While server-rendering or on the first split-second of the client, show a skeleton
  if (!mounted) {
    return (
      <div className="w-full max-w-md h-[500px] bg-white/50 rounded-xl shadow-lg animate-pulse" />
    );
  }

  // Once mounted, render the actual form
  return <LoginForm />;
}
