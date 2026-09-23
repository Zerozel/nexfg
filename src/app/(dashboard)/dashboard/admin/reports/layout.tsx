// src/app/(dashboard)/dashboard/admin/reports/layout.tsx
//
// Route-group layout for the Report Cards / Reports section.
// Responsibilities:
//   1. Import print stylesheets (scoped to /reports/* and children only)
//   2. Provide a single shared `useClassesDropdown()` fetch to all children
//      (classes + terms) so the hub, PrintControls, and any child page read
//      the same data from one request.
//
// Print pages (`*/print/page.tsx`) still render standalone — the provider is
// harmless there because they don't consume the dropdown data.

"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { ClassesDropdownData } from "@/types/printing";
import "@/styles/print.css";
import "@/styles/report-card.css";

interface DropdownContextValue {
  data: ClassesDropdownData | null;
  isLoading: boolean;
  error: string | null;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined
);

export function useClassesDropdownContext(): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error(
      "useClassesDropdownContext must be used inside <ReportsLayout>"
    );
  }
  return ctx;
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<ClassesDropdownData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/report-cards/classes");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch classes");
        }
        const result = await res.json();
        if (!result.success || !result.data) {
          throw new Error("Invalid response format");
        }
        if (!cancelled) setData(result.data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ data, isLoading, error }),
    [data, isLoading, error]
  );

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
}
