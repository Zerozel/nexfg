// src/lib/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client components
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (typeof window === "undefined") {
    // SSR — create a new instance each time
    return createClient();
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
})();
