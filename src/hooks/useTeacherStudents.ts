'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useTeacherStudents(classId: string, termId?: string) {
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

        // If no termId provided, get current term
        let targetTermId: string | undefined = termId;
        if (!targetTermId) {
          const { data: currentTerm } = await supabase
            .from('terms')
            .select('id')
            .eq('is_current', true)
            .is('is_deleted', false)
            .maybeSingle() as { data: { id: string } | null };

          if (!currentTerm) {
            setData([]);
            setLoading(false);
            return;
          }
          targetTermId = currentTerm.id;
        }

        if (!targetTermId) {
          setData([]);
          setLoading(false);
          return;
        }

        // Fetch students enrolled in this class for this term
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select(`
            student_id,
            students!inner (
              id,
              full_name,
              admission_number
            )
          `)
          .eq('class_id', classId)
          .eq('term_id', targetTermId)
          .eq('is_current', true)
          .is('students.is_deleted', false);

        if (enrollError) throw enrollError;

        const students = enrollments?.map((e: any) => ({
          id: e.students.id,
          full_name: e.students.full_name,
          admission_number: e.students.admission_number,
        })) || [];

        setData(students);
      } catch (err) {
        console.error('useTeacherStudents error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [classId, termId]);

  return { data, loading, error };
}