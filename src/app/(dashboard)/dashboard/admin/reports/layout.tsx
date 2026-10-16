"use client";

import { useEffect, useState, useMemo } from "react";
import type { ClassesDropdownData } from "@/types/printing";
import {
  DropdownContext,
  type DropdownContextValue,
} from "./dropdown-context";
import "@/styles/print.css";
import "@/styles/report-card.css";

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

  const value = useMemo<DropdownContextValue>(
    () => ({ data, isLoading, error }),
    [data, isLoading, error]
  );

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
}
