"use client";

import { useState, useEffect, useCallback } from "react";

interface SubjectPerformance {
  name: string;
  average: number;
  below_pass: number;
  total_students: number;
}

interface ClassPerformance {
  name: string;
  average: number;
  total_scores: number;
}

interface AtRiskStudent {
  student_id: string;
  full_name: string;
  admission_number: string | null;
  failing_count: number;
  failing_subjects: string[];
  average_of_failing: number;
}

interface AnalyticsData {
  locked: boolean;
  reason?: string;
  tier?: string;
  term: { id: string; name: string } | null;
  pass_mark?: number;
  subject_performance?: SubjectPerformance[];
  class_performance?: ClassPerformance[];
  at_risk_students?: AtRiskStudent[];
}

interface UseAdminAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminAnalytics(): UseAdminAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/analytics/overview");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch analytics");
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
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, isLoading, error, refetch: fetchAnalytics };
}
