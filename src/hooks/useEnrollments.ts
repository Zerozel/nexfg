'use client';

import { useState, useEffect, useCallback } from 'react';
import { Enrollment, BulkEnrollmentResult, UnenrolledStudent } from '@/types/admin';

interface UseEnrollmentsParams {
  classId: string;
  termId: string;
  page?: number;
  pageSize?: number;
}

export function useEnrollments(params: UseEnrollmentsParams) {
  const [data, setData] = useState<{ data: Enrollment[]; meta: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!params.classId || !params.termId) return;
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        classId: params.classId,
        termId: params.termId,
        page: (params.page || 1).toString(),
        limit: (params.pageSize || 10).toString(),
      });
      const response = await fetch(`/api/admin/enrollments?${queryParams}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch enrollments');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [params.classId, params.termId, params.page, params.pageSize]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { data, isLoading, error, refetch: fetchEnrollments };
}

export function useUnenrolledStudents(classId: string, termId: string) {
  const [data, setData] = useState<UnenrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnenrolled = useCallback(async () => {
    if (!classId || !termId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/unenrolled-students?classId=${classId}&termId=${termId}`
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch unenrolled students');
      }
      const result = await response.json();
      setData(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [classId, termId]);

  useEffect(() => {
    fetchUnenrolled();
  }, [fetchUnenrolled]);

  return { data, isLoading, error, refetch: fetchUnenrolled };
}

export function useEnrollmentMutations() {
  const enrollSingle = async (data: {
    student_id: string;
    class_id: string;
    term_id: string;
  }) => {
    const response = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to enroll student');
    }
    return response.json();
  };

  const enrollBulk = async (data: {
    student_ids: string[];
    class_id: string;
    term_id: string;
  }): Promise<BulkEnrollmentResult & { success: boolean }> => {
    const response = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to enroll students');
    }
    return response.json();
  };

  const enrollCsv = async (data: {
    admission_numbers: string[];
    class_id: string;
    term_id: string;
  }): Promise<BulkEnrollmentResult & { success: boolean }> => {
    const response = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to enroll students');
    }
    return response.json();
  };

  const unenrollStudent = async (
    studentId: string,
    classId: string,
    termId: string
  ) => {
    const response = await fetch(
      `/api/admin/enrollments/${studentId}?classId=${classId}&termId=${termId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to unenroll student');
    }
    return response.json();
  };

  return { enrollSingle, enrollBulk, enrollCsv, unenrollStudent };
}
