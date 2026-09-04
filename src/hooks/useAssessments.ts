'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Assessment } from '@/types';
 
// ============================================================
// Phase 6.1: Direct Supabase hook (for teacher score entry)
// ============================================================

export function useAssessments(classId: string, subjectId?: string) {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssessments() {
      try {
        // ✅ Fetch global assessments (is_auto_created = true)
        // These are the 4 templates: CA1, CA2, CA3, Exam
        // They are NOT tied to any specific class, subject, or term
        const { data: assessments, error: fetchError } = await supabase
          .from('assessments')
          .select('*')
          .eq('is_auto_created', true)
          .is('is_deleted', false)
          .order('name');

        if (fetchError) throw fetchError;
        setData(assessments || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch assessments'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, []); // ✅ No dependencies — fetches once and caches

  return { data, loading, error };
}

// ============================================================
// Phase 6.2: Admin API-based hook (for dashboard with filters + pagination)
// ============================================================

interface UseAdminAssessmentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  classId?: string;
  subjectId?: string;
  termId?: string;
  type?: string;
}

export function useAdminAssessments(params: UseAdminAssessmentsParams = {}) {
  const [data, setData] = useState<{ data: Assessment[]; meta: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = useCallback(() => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.pageSize) searchParams.set('limit', params.pageSize.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.subjectId) searchParams.set('subjectId', params.subjectId);
    if (params.termId) searchParams.set('termId', params.termId);
    if (params.type) searchParams.set('type', params.type);
    return searchParams.toString();
  }, [params]);

  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/assessments?${buildQueryString()}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch assessments');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return { data, isLoading, error, refetch: fetchAssessments };
}

export function useAssessmentMutations() {
  const createAssessment = async (data: Partial<Assessment>) => {
    const response = await fetch('/api/admin/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create assessment');
    }
    return response.json();
  };

  const updateAssessment = async (id: string, data: Partial<Assessment>) => {
    const response = await fetch(`/api/admin/assessments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update assessment');
    }
    return response.json();
  };

  const deleteAssessment = async (id: string) => {
    const response = await fetch(`/api/admin/assessments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete assessment');
    }
    return response.json();
  };

  return { createAssessment, updateAssessment, deleteAssessment };
}