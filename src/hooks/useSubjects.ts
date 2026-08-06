'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subject, PaginatedResponse } from '@/types/admin';
import { createClient } from '@/lib/supabase/client';

interface UseSubjectsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useSubjects(params: UseSubjectsParams = {}) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const [data, setData] = useState<PaginatedResponse<Subject> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      });
      const response = await fetch(`/api/admin/subjects?${queryParams}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch subjects');
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
    fetchSubjects();
  }, [fetchSubjects]);

  return { data, isLoading, error, refetch: fetchSubjects };
}

export function useSubjectMutations() {
  const createSubject = async (subjectData: Partial<Subject>) => {
    const response = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create subject');
    }
    return response.json();
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    const response = await fetch(`/api/admin/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update subject');
    }
    return response.json();
  };

  const deleteSubject = async (id: string) => {
    const response = await fetch(`/api/admin/subjects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete subject');
    }
    return response.json();
  };

  return { createSubject, updateSubject, deleteSubject };
}
