'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface TeacherClass {
  id: string;
  [key: string]: unknown;
}

export function useTeacherClasses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
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

        // Get classes where teacher is the class teacher
        const { data: classes, error: fetchError } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .eq('teacher_id', teacherId)
          .is('is_deleted', false)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        // Get classes where teacher is assigned via class_subjects
        const { data: assignments, error: assignError } = await supabase
          .from('class_subjects')
          .select('class_id')
          .eq('teacher_id', teacherId);

        if (assignError) throw assignError;

        const assignedClassIds = assignments?.map((a: any) => a.class_id) || [];

        let additionalClasses: any[] = [];
        if (assignedClassIds.length > 0) {
          const { data: extra, error: extraError } = await supabase
            .from('classes')
            .select('*')
            .in('id', assignedClassIds)
            .is('is_deleted', false)
            .order('name', { ascending: true });

          if (!extraError && extra) {
            additionalClasses = extra;
          }
        }

        // Combine and deduplicate
        const allClasses: TeacherClass[] = [...(classes || [])];
        for (const cls of additionalClasses) {
          if (!allClasses.find(c => c.id === cls.id)) {
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