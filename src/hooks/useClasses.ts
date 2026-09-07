'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Class } from '@/types';
import type { PaginatedResponse } from '@/types/admin';

// ============================================================
// Phase 6.1: Teacher-specific classes (Form Teacher + Subject Teacher)
// ============================================================

export function useTeacherClasses() {
  const [data, setData] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const teacherId = user.id;
        const schoolId = user.app_metadata?.school_id;

        if (!schoolId) {
          setError('No school associated');
          setLoading(false);
          return;
        }

        // ✅ 1. Get classes where teacher is the Form Teacher
        const { data: formClasses, error: formError } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .eq('teacher_id', teacherId)
          .is('is_deleted', false)
          .order('name');

        if (formError) throw formError;

        // ✅ 2. Get classes where teacher is a Subject Teacher (via class_subjects)
        const { data: assignments, error: assignError } = await supabase
          .from('class_subjects')
          .select('class_id')
          .eq('teacher_id', teacherId);

        if (assignError) throw assignError;

        const assignedClassIds = assignments?.map((a: any) => a.class_id) || [];

        // ✅ 3. Fetch those classes
        let subjectClasses: any[] = [];
        if (assignedClassIds.length > 0) {
          const { data: extra, error: extraError } = await supabase
            .from('classes')
            .select('*')
            .in('id', assignedClassIds)
            .is('is_deleted', false)
            .order('name');

          if (!extraError && extra) {
            subjectClasses = extra;
          }
        }

        // ✅ 4. Combine and deduplicate
        const allClasses = [...(formClasses || [])];
        const seenIds = new Set(allClasses.map((c) => c.id));

        for (const cls of subjectClasses) {
          if (!seenIds.has(cls.id)) {
            seenIds.add(cls.id);
            allClasses.push(cls);
          }
        }

        setData(allClasses);
      } catch (err) {
        console.error('useTeacherClasses error:', err);
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
