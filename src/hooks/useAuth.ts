// hooks/useAuth.ts — UPDATED: getUser() instead of getSession()
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
    // SECURE: Validate JWT with Supabase Auth server
    supabase.auth
      .getUser()
      .then(({ data: { user: authUser }, error }) => {
        setUser(error ? null : authUser);
        setLoading(false);
      });

    // Listen for auth changes — re-validate with getUser() for security
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          // onAuthStateChange gives us the session for immediate UI updates,
          // but we re-validate with getUser() to ensure the token is authentic
          supabase.auth.getUser().then(({ data: { user: validatedUser }, error }) => {
            setUser(error ? null : validatedUser);
            setLoading(false);
          });
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const role = user?.app_metadata?.role as UserRole | undefined;

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
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
