"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface SchoolNameRow {
  name: string;
}

/**
 * Returns the current user's school name, or null while loading / for
 * users with no school (e.g. super_admin).
 */
export function useCurrentSchoolName(): string | null {
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const schoolId = user?.app_metadata?.school_id;
      if (!schoolId) return;

      const result = (await supabase
        .from("schools")
        .select("name")
        .eq("id", schoolId)
        .maybeSingle()) as unknown as { data: SchoolNameRow | null };

      if (!cancelled && result.data?.name) {
        setSchoolName(result.data.name);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return schoolName;
}
