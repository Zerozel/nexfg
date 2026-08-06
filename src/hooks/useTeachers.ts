'use client';

import { useState, useEffect, useCallback } from 'react';
import { Teacher, PaginatedResponse } from '@/types/admin';
import { createClient } from '@/lib/supabase/client';

interface UseTeachersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useTeachers(params: UseTeachersParams = {}) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const [data, setData] = useState<PaginatedResponse<Teacher> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      });
      const response = await fetch(`/api/admin/teachers?${queryParams}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch teachers');
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
    fetchTeachers();
  }, [fetchTeachers]);

  return { data, isLoading, error, refetch: fetchTeachers };
}

export function useTeacherMutations() {
  const createTeacher = async (teacherData: { full_name: string; email: string; role: string }) => {
    const response = await fetch('/api/admin/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create teacher');
    }
    return response.json();
  };

  const updateTeacher = async (id: string, teacherData: Partial<Teacher>) => {
    const response = await fetch(`/api/admin/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update teacher');
    }
    return response.json();
  };

  const deleteTeacher = async (id: string) => {
    const response = await fetch(`/api/admin/teachers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete teacher');
    }
    return response.json();
  };

  return { createTeacher, updateTeacher, deleteTeacher };
}
