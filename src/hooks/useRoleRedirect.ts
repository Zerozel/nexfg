// hooks/useRoleRedirect.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { getDashboardRoute } from "@/config/roles";
import type { UserRole } from "@/types";

export function useRoleRedirect() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && role) {
      router.push(getDashboardRoute(role));
    }
  }, [loading, user, role, router]);

  return { loading, isAuthenticated: !!user };
}
