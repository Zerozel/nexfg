'use client';

import { useState, useEffect, useCallback } from 'react';
import { SuperAdminStats } from '@/types/super-admin';

export function useSuperAdminStats() {
  const [data, setData] = useState<SuperAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/super-admin/stats');
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch stats');
      }
      const result = await response.json();
      setData(result.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}
