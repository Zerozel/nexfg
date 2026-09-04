// src/hooks/useClassStudents.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UseClassStudentsOptions {
  termId?: string;
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

        // ✅ Query the students table directly using class_id
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
          const { data: scores, error: scoresError } = await supabase
            .from('scores')
            .select('student_id, assessment_id, score')
            .in('student_id', studentIds) as {
              data: ScoreRow[] | null;
              error: Error | null;
            };

          if (scoresError) {
            console.error('useClassStudents scores error:', scoresError);
          } else {
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
  }, [classId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}