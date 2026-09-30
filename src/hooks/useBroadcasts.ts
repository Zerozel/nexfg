"use client";

import { useState, useEffect, useCallback } from "react";

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  dismissible: boolean;
  created_at: string;
}

interface UseBroadcastsReturn {
  broadcasts: Broadcast[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBroadcasts(): UseBroadcastsReturn {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/broadcasts");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load broadcasts");
      }
      const result = await res.json();
      setBroadcasts(result.data.broadcasts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  return { broadcasts, isLoading, error, refetch: fetchBroadcasts };
}
