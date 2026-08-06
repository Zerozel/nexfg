'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Class } from '@/types';
import type { PaginatedResponse } from '@/types/admin';

// ============================================================
// Phase 6.1: Existing hook — Teacher-specific classes
// ============================================================

export function useTeacherClasses() {
  const [data, setData] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: classes, error: fetchError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)
          .order('name');

        if (fetchError) throw fetchError;
        setData(classes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

  return { data, loading, error };
}

// ============================================================
// Phase 6.2: Admin API-based hook (paginated, searchable, with mutations)
// ============================================================

interface UseAdminClassesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useAdminClasses(params: UseAdminClassesParams = {}) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const [data, setData] = useState<PaginatedResponse<Class> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      });
      const response = await fetch(`/api/admin/classes?${queryParams}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch classes');
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
    fetchClasses();
  }, [fetchClasses]);

  return { data, isLoading, error, refetch: fetchClasses };
}

export function useClassMutations() {
  const createClass = async (classData: Partial<Class>) => {
    const response = await fetch('/api/admin/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create class');
    }
    return response.json();
  };

  const updateClass = async (id: string, classData: Partial<Class>) => {
    const response = await fetch(`/api/admin/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update class');
    }
    return response.json();
  };

  const deleteClass = async (id: string) => {
    const response = await fetch(`/api/admin/classes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete class');
    }
    return response.json();
  };

  return { createClass, updateClass, deleteClass };
}
