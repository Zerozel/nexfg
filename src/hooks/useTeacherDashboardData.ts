'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TeacherClass } from '@/types/teacher';

interface AssignmentRecord {
  class_id: string;
  subjects: { id: string; name: string; code: string | null } | null;
  classes: { id: string; name: string; academic_year_id: string };
}

export function useTeacherDashboardData() {
  const [data, setData] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

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

        // Fetch all class-subject assignments for this teacher
        const { data: assignments, error: assignmentsError } = await supabase
          .from('class_subjects')
          .select(`
            class_id,
            subject_id,
            subjects!inner (
              id,
              name,
              code
            ),
            classes!inner (
              id,
              name,
              academic_year_id
            )
          `)
          .eq('teacher_id', teacherId) as { data: AssignmentRecord[] | null; error: Error | null };

        if (assignmentsError) throw assignmentsError;

        // Group by class
        const classMap: Record<string, TeacherClass> = {};

        for (const assignment of assignments || []) {
          const classId = assignment.class_id;
          const classData = assignment.classes;

          if (!classMap[classId]) {
            classMap[classId] = {
              id: classData.id,
              name: classData.name,
              academic_year_id: classData.academic_year_id,
              subjects: [],
            };
          }

          if (assignment.subjects) {
            classMap[classId].subjects.push({
              id: assignment.subjects.id,
              name: assignment.subjects.name,
              code: assignment.subjects.code || '',
            });
          }
        }

        // For each class, get assessment count per subject
        const classes = Object.values(classMap);
        for (const cls of classes) {
          for (const subject of cls.subjects) {
            const { count, error: countError } = await supabase
              .from('assessments')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id)
              .eq('subject_id', subject.id)
              .is('is_deleted', false);

            if (!countError) {
              subject.assessments_count = count || 0;
            }
          }
        }

        setData(classes);
      } catch (err) {
        console.error('useTeacherDashboardData error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}