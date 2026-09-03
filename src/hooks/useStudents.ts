'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Student as AdminStudent } from '@/types/admin';
import type { Student } from '@/types';
import type { PaginatedResponse } from '@/types/admin';

// ============================================================
// Phase 6.1: Existing hook — Class-specific students
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
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .eq('is_active', true)
          .order('full_name');

        if (fetchError) throw fetchError;
        setData(students || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch students'
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
// Phase 6.2: Admin API-based hook (paginated, searchable, with mutations)
// ============================================================

interface UseAdminStudentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useAdminStudents(params: UseAdminStudentsParams = {}) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const [data, setData] = useState<PaginatedResponse<AdminStudent> | null>(null);
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
        throw new Error(err.error || 'Failed to fetch students');
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

export function useStudentMutations() {
  const createStudent = async (studentData: Partial<AdminStudent>) => {
    const response = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create student');
    }
    return response.json();
  };

  const updateStudent = async (id: string, studentData: Partial<AdminStudent>) => {
    const response = await fetch(`/api/admin/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update student');
    }
    return response.json();
  };

  const deleteStudent = async (id: string) => {
    const response = await fetch(`/api/admin/students/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete student');
    }
    return response.json();
  };

  return { createStudent, updateStudent, deleteStudent };
}
