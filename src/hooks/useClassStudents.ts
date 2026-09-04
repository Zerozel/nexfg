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
    console.log('🔍 useClassStudents: classId =', classId);

    if (!classId) {
      setData([]);
      setLoading(false);
      return;
    }

    async function fetchStudents() {
      try {
        setLoading(true);
        setError(null);

        // ✅ Query the students table directly using class_id
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id, full_name, admission_number')
          .eq('class_id', classId)
          .is('is_deleted', false)
          .order('full_name', { ascending: true });

        if (studentsError) {
          setError('Failed to fetch students');
          console.error('useClassStudents error:', studentsError);
          setLoading(false);
          return;
        }

        setData(students || []);
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