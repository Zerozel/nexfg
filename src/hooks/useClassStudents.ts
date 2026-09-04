// src/hooks/useClassStudents.ts
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UseClassStudentsOptions {
  termId?: string;
}

export function useClassStudents(classId: string, options?: UseClassStudentsOptions) {
  const [data, setData] = useState<any[]>([]);
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
        setLoading(true);
        setError(null);

        // Determine which term to use
        let targetTermId = options?.termId;

        if (!targetTermId) {
          // Get current term
          const { data: currentTerm, error: termError } = await supabase
            .from('terms')
            .select('id')
            .eq('is_current', true)
            .is('is_deleted', false)
            .maybeSingle();

          if (termError) {
            throw new Error('Failed to fetch current term');
          }

          const resolvedCurrentTerm = currentTerm as { id: string } | null;

          if (!resolvedCurrentTerm) {
            setData([]);
            setLoading(false);
            return;
          }

          targetTermId = resolvedCurrentTerm.id;
        }

        if (!targetTermId) {
          setData([]);
          return;
        }

        // Fetch students enrolled in this class for the term
        // Using the same simpler query pattern
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select(`
            student_id,
            class_id,
            term_id,
            enrollment_date,
            is_current,
            students (
              id,
              full_name,
              admission_number,
              school_id,
              is_deleted
            )
          `)
          .eq('class_id', classId)
          .eq('term_id', targetTermId)
          .eq('is_current', true)
          .is('students.is_deleted', false);

        if (enrollError) {
          throw enrollError;
        }

        const students = ((enrollments || []) as any[])
          .filter((enrollment: any) => enrollment.students != null)
          .map((enrollment: any) => ({
            id: enrollment.students.id,
            full_name: enrollment.students.full_name,
            admission_number: enrollment.students.admission_number,
          }));

        setData(students);
      } catch (err) {
        console.error('useClassStudents error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [classId, options?.termId]);

  return { data, loading, error };
}