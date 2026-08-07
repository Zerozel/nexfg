"use client";

import { useState, useEffect } from "react";
import type {
  IndividualReportCardData,
  ClassesDropdownData,
} from "@/types/printing";
import { transformStudentReportData } from "@/lib/printing/data-transform";

interface UseReportCardOptions {
  studentId: string;
  termId: string;
  classId: string;
}

interface UseReportCardReturn {
  data: IndividualReportCardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReportCard({
  studentId,
  termId,
  classId,
}: UseReportCardOptions): UseReportCardReturn {
  const [data, setData] = useState<IndividualReportCardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!studentId || !termId || !classId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/report-cards/student/${studentId}?termId=${termId}&classId=${classId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch report card");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const transformed = transformStudentReportData(result.data);
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
  }, [studentId, termId, classId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

interface UseClassesDropdownReturn {
  data: ClassesDropdownData | null;
  isLoading: boolean;
  error: string | null;
}

export function useClassesDropdown(): UseClassesDropdownReturn {
  const [data, setData] = useState<ClassesDropdownData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/report-cards/classes");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch classes"
          );
        }

        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return { data, isLoading, error };
}
