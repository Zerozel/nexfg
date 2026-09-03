'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface CurrentTerm {
  id: string;
}

export function useClassStudents(classId: string) {
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

        // Get current term
        const { data: currentTerm } = await supabase
          .from('terms')
          .select('id')
          .eq('is_current', true)
          .is('is_deleted', false)
          .maybeSingle() as { data: CurrentTerm | null };

        if (!currentTerm) {
          setData([]);
          setLoading(false);
          return;
        }

        // Fetch students enrolled in this class for the current term
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('student_id, students(full_name, admission_number, id)')
          .eq('class_id', classId)
          .eq('term_id', currentTerm.id)
          .eq('is_current', true)
          .is('is_deleted', false);

        if (enrollError) throw enrollError;

        const students = enrollments?.map((e: any) => ({
          id: e.students?.id,
          full_name: e.students?.full_name,
          admission_number: e.students?.admission_number,
        })) || [];

        setData(students);
      } catch (err) {
        console.error('useClassStudents error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [classId]);

  return { data, loading, error };
}