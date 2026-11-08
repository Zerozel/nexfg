// src/hooks/useStudents.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Student as AdminStudent } from "@/types/admin";
import type { Student } from "@/types";
import type { PaginatedResponse } from "@/types/admin";

// ============================================================
// Structured API error — carries the tier/cap metadata so the
// form can render an upgrade CTA without string-matching.
// ============================================================

export interface StudentApiError {
  message: string;
  code?: string;
  tier?: string;
  cap?: number;
  current?: number;
  status?: string;
}

async function parseStudentApiError(
  res: Response,
  fallback: string
): Promise<StudentApiError> {
  try {
    const data = await res.json();
    return {
      message: data?.error || fallback,
      code: data?.code,
      tier: data?.tier,
      cap: data?.cap,
      current: data?.current,
      status: data?.status,
    };
  } catch {
    return { message: fallback };
  }
}

// ============================================================
// Existing hook — Class-specific students
// ============================================================

export function useClassStudents(classId: string) {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) {
      setData([]);
      setLoading(false);
      return;
    }

    async function fetchStudents() {
      try {
        const { data: students, error: fetchError } = await supabase
          .from("students")
          .select("*")
          .eq("class_id", classId)
          .eq("is_active", true)
          .order("full_name");

        if (fetchError) throw fetchError;
        setData(students || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch students"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [classId]);

  return { data, loading, error };
}

// ============================================================
// Admin API-based hook (paginated, searchable)
// ============================================================

interface UseAdminStudentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useAdminStudents(params: UseAdminStudentsParams = {}) {
  const { page = 1, pageSize = 10, search = "" } = params;
  const [data, setData] = useState<PaginatedResponse<AdminStudent> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      });
      const response = await fetch(`/api/admin/students?${queryParams}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch students");
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { data, isLoading, error, refetch: fetchStudents };
}

// ============================================================
// useStudentsByClass — grouped view for paid tiers
// ============================================================

export interface StudentGroup {
  class_id: string | null;
  class_name: string;
  base_name: string | null;
  display_order: number | null;
  students: AdminStudent[];
}

interface UseStudentsByClassReturn {
  groups: StudentGroup[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStudentsByClass(): UseStudentsByClassReturn {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrouped = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/students?grouped=1");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch grouped students");
      }
      const result = await response.json();
      setGroups(result.groups || []);
    } catch (err: any) {
      setError(err.message);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrouped();
  }, [fetchGrouped]);

  return { groups, isLoading, error, refetch: fetchGrouped };
}

// ============================================================
// Mutations
// ============================================================

export function useStudentMutations() {
  const createStudent = async (studentData: Partial<AdminStudent>) => {
    const response = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const err = await parseStudentApiError(
        response,
        "Failed to create student"
      );
      const error = new Error(err.message) as Error & StudentApiError;
      error.code = err.code;
      error.tier = err.tier;
      error.cap = err.cap;
      error.current = err.current;
      error.status = err.status;
      throw error;
    }
    return response.json();
  };

  const updateStudent = async (
    id: string,
    studentData: Partial<AdminStudent>
  ) => {
    const response = await fetch(`/api/admin/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update student");
    }
    return response.json();
  };

  const deleteStudent = async (id: string) => {
    const response = await fetch(`/api/admin/students/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete student");
    }
    return response.json();
  };

  return { createStudent, updateStudent, deleteStudent };
}
