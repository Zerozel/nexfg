'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useFormClassSubjects(classId: string) {
  const [activeSubjects, setActiveSubjects] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!classId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the school ID from the user
      const { data: { user } } = await supabase.auth.getUser();
      const schoolId = user?.app_metadata?.school_id;

      if (!schoolId) {
        setError('No school associated');
        setLoading(false);
        return;
      }

      // Get all subjects for the school
      const { data: allSubjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .is('is_deleted', false)
        .order('name');

      if (subjectsError) throw subjectsError;

      // Get active subjects with teacher_id for this class
      const { data: classSubjects, error: classError } = await supabase
        .from('class_subjects')
        .select('subject_id, teacher_id')
        .eq('class_id', classId);

      if (classError) throw classError;

      const activeIds = (classSubjects || []).map((cs: any) => cs.subject_id);
      
      // Build teacher map
      const teacherMap: Record<string, string> = {};
      (classSubjects || []).forEach((cs: any) => {
        if (cs.teacher_id) {
          teacherMap[cs.subject_id] = cs.teacher_id;
        }
      });

      // Build active subjects with teacher_id included
      const active = (allSubjects || [])
        .filter((s: any) => activeIds.includes(s.id))
        .map((s: any) => ({
          ...s,
          teacher_id: teacherMap[s.id] || null,
        }));

      const available = (allSubjects || []).filter((s: any) => !activeIds.includes(s.id));

      setActiveSubjects(active);
      setAvailableSubjects(available);
    } catch (err) {
      console.error('useFormClassSubjects error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { activeSubjects, availableSubjects, loading, error, refetch };
}