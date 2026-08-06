'use client';

import { useState, useEffect, useCallback } from 'react';
import { TeacherAssignment } from '@/types/admin';

export function useTeacherAssignments(classId: string) {
  const [data, setData] = useState<TeacherAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/teacher-assignments?classId=${classId}`
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch assignments');
      }
      const result = await response.json();
      setData(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { data, isLoading, error, refetch: fetchAssignments };
}

export function useUnassignedSubjects(classId: string) {
  const [data, setData] = useState<{ id: string; name: string; code: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnassigned = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/unassigned-subjects?classId=${classId}`
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch subjects');
      }
      const result = await response.json();
      setData(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchUnassigned();
  }, [fetchUnassigned]);

  return { data, isLoading, error, refetch: fetchUnassigned };
}

export function useTeacherAssignmentMutations() {
  const assignTeacher = async (data: {
    class_id: string;
    subject_id: string;
    teacher_id: string;
  }) => {
    const response = await fetch('/api/admin/teacher-assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to assign teacher');
    }
    return response.json();
  };

  const removeAssignment = async (id: string) => {
    const response = await fetch(`/api/admin/teacher-assignments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to remove assignment');
    }
    return response.json();
  };

  return { assignTeacher, removeAssignment };
}
