"use client";

import { useState, useEffect, useCallback } from "react";

interface OnboardingStep {
  done: boolean;
  count: number;
  required?: number;
}

interface OnboardingData {
  steps: Record<string, OnboardingStep>;
  complete: boolean;
  percent: number;
  done_steps: number;
  total_steps: number;
  has_seen_welcome: boolean;
}

interface UseOnboardingReturn {
  data: OnboardingData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markWelcomeSeen: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboarding = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/onboarding");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch onboarding");
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

  const markWelcomeSeen = useCallback(async () => {
    try {
      await fetch("/api/admin/onboarding/welcome", { method: "POST" });
      setData((prev) =>
        prev ? { ...prev, has_seen_welcome: true } : prev
      );
    } catch (err) {
      console.error("Failed to mark welcome seen:", err);
    }
  }, []);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchOnboarding,
    markWelcomeSeen,
  };
}
