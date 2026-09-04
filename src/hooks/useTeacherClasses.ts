'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useTeacherClasses() {
  const [data, setData] = useState<any[]>([]);
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

        // 1. Get classes where teacher is the Form Teacher
        const { data: formClasses, error: formError } = await supabase
          .from('classes')
          .select('*, academic_years!inner(name)')
          .eq('school_id', schoolId)
          .eq('teacher_id', teacherId)
          .is('is_deleted', false)
          .order('name');

        if (formError) throw formError;

        // 2. Get classes where teacher is a Subject Teacher (via class_subjects)
        const { data: assignments, error: assignError } = await supabase
          .from('class_subjects')
          .select(`
            class_id,
            classes!inner (
              id,
              name,
              academic_year_id,
              academic_years!inner(name)
            )
          `)
          .eq('teacher_id', teacherId);

        if (assignError) throw assignError;

        // Start with form classes
        const allClasses: any[] = [...(formClasses || [])];
        const seenIds = new Set(allClasses.map((c: any) => c.id));

        // Add subject classes if not already present
        for (const assignment of (assignments || [])) {
          const cls = (assignment as any).classes;
          if (cls && !seenIds.has(cls.id)) {
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