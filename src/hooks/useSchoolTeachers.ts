'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useSchoolTeachers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        const schoolId = user?.app_metadata?.school_id;

        if (!schoolId) {
          setError('No school associated');
          setLoading(false);
          return;
        }

        const { data: teachers, error: teachersError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('school_id', schoolId)
          .in('role', ['teacher', 'admin', 'principal'])
          .is('is_deleted', false)
          .order('full_name');

        if (teachersError) throw teachersError;

        setData(teachers || []);
      } catch (err) {
        console.error('useSchoolTeachers error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
      } finally {
        setLoading(false);
      }
    }

    fetchTeachers();
  }, []);

  return { data, loading, error };
}