"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminStats {
  students: number;
  teachers: number;
  classes: number;
}

interface UseAdminStatsReturn {
  data: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminStats(): UseAdminStatsReturn {
  const [data, setData] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch stats");
      }
      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error("Invalid response format");
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}
