"use client";

import { useState, useEffect } from "react";
import type { ClassResultSheetData } from "@/types/printing";
import { transformClassResultData } from "@/lib/printing/data-transform";

interface UseClassReportCardsOptions {
  classId: string;
  termId: string;
}

interface UseClassReportCardsReturn {
  data: ClassResultSheetData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClassReportCards({
  classId,
  termId,
}: UseClassReportCardsOptions): UseClassReportCardsReturn {
  const [data, setData] = useState<ClassResultSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!classId || !termId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/report-cards/class/${classId}?termId=${termId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch class report cards"
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        const transformed = transformClassResultData(result.data);
        setData(transformed);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId, termId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
