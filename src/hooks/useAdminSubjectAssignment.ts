// src/hooks/useAdminSubjectAssignment.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AssignmentArm {
  id: string;
  name: string;
  base_name: string | null;
  display_order: number | null;
}

export interface AssignmentCell {
  class_subject_id: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
}

export interface AssignmentSubject {
  id: string;
  name: string;
  code: string | null;
  per_arm: Record<string, AssignmentCell>;
}

export interface AssignmentTeacher {
  id: string;
  full_name: string;
}

export interface AssignmentMatrix {
  base_name: string;
  arms: AssignmentArm[];
  subjects: AssignmentSubject[];
  teachers: AssignmentTeacher[];
}

export function useAdminSubjectAssignment(baseName: string | null) {
  const [data, setData] = useState<AssignmentMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = useCallback(async () => {
    if (!baseName) {
      setData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/subject-assignment?baseName=${encodeURIComponent(baseName)}`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to load');
      setData(body.data);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [baseName]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  return { data, isLoading, error, refetch: fetchMatrix };
}

export async function assignTeacher(payload: {
  class_id?: string;
  base_name?: string;
  subject_id: string;
  teacher_id: string | null;
}) {
  const res = await fetch('/api/admin/subject-assignment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Assignment failed');
  return body.data;
}
