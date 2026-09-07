// src/hooks/useClassStudents.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UseClassStudentsOptions {
  termId?: string;
  subjectId?: string;  // ✅ NEW: Filter scores by subject
}

interface StudentRow {
  id: string;
  full_name: string;
  admission_number: string | null;
}

interface ScoreRow {
  student_id: string;
  assessment_id: string;
  score: number | null;
}

export function useClassStudents(classId: string, options?: UseClassStudentsOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
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

        // ✅ 1. Get students in the class
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id, full_name, admission_number')
          .eq('class_id', classId)
          .is('is_deleted', false)
          .order('full_name', { ascending: true }) as {
            data: StudentRow[] | null;
            error: Error | null;
          };

        if (studentsError) {
          setError('Failed to fetch students');
          console.error('useClassStudents error:', studentsError);
          setLoading(false);
          return;
        }

        const studentRows = students || [];
        const studentIds = studentRows.map((student) => student.id);
        let scoresByStudent: Record<string, Record<string, number | null>> = {};

        if (studentIds.length > 0) {
          // ✅ 2. Get all assessments for the selected subject
          let assessmentIds: string[] = [];
          if (options?.subjectId) {
            const { data: assessments, error: assessError } = await supabase
              .from('assessments')
              .select('id')
              .eq('subject_id', options.subjectId)
              .is('is_deleted', false);

            if (assessError) {
              console.error('Error fetching assessments for subject:', assessError);
            } else if (assessments) {
              assessmentIds = assessments.map((a: any) => a.id);
            }
          }

          // ✅ 3. Fetch scores filtered by assessment IDs
          let scoresQuery = supabase
            .from('scores')
            .select('student_id, assessment_id, score')
            .in('student_id', studentIds) as any;

          // ✅ If we have assessment IDs, filter by them
          if (assessmentIds.length > 0) {
            scoresQuery = scoresQuery.in('assessment_id', assessmentIds);
          }

          const { data: scores, error: scoresError } = await scoresQuery as {
            data: ScoreRow[] | null;
            error: Error | null;
          };

          if (scoresError) {
            console.error('useClassStudents scores error:', scoresError);
          } else {
            // ✅ Build score map
            scoresByStudent = (scores || []).reduce(
              (map, score) => {
                if (!map[score.student_id]) {
                  map[score.student_id] = {};
                }
                map[score.student_id][score.assessment_id] = score.score;
                return map;
              },
              {} as Record<string, Record<string, number | null>>
            );
          }
        }

        // ✅ 4. Attach scores to students
        setData(
          studentRows.map((student) => ({
            ...student,
            scores: scoresByStudent[student.id] || {},
          }))
        );
      } catch (err) {
        console.error('useClassStudents error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [classId, options?.subjectId, options?.termId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
