// hooks/useAuth.ts — FIXED (added type annotations)
"use client";

import { useEffect, useState, useCallback } from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getDashboardRoute } from "@/config/roles";
import type { UserRole } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const role = user?.app_metadata?.role as UserRole | undefined;

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    if (role) {
      router.push(getDashboardRoute(role));
    }
  }, [role, router]);

  return {
    user,
    role,
    loading,
    signOut,
    redirectToDashboard,
    isAuthenticated: !!user,
  };
}
