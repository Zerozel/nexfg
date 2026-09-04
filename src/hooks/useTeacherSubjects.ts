'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useTeacherSubjects(classId?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubjects() {
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

        let query = supabase
          .from('class_subjects')
          .select(`
            subject_id,
            class_id,
            subjects!inner (
              id,
              name,
              code
            ),
            classes!inner (
              id,
              name
            )
          `)
          .eq('teacher_id', teacherId);

        if (classId) {
          query = query.eq('class_id', classId);
        }

        const { data: assignments, error: assignError } = await query;

        if (assignError) throw assignError;

        const subjects = (assignments || []).map((a: any) => ({
          id: a.subjects.id,
          name: a.subjects.name,
          code: a.subjects.code,
          class_id: a.class_id,
          class_name: a.classes?.name,
        }));

        setData(subjects);
      } catch (err) {
        console.error('useTeacherSubjects error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [classId]);

  return { data, loading, error };
} 