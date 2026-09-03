// src/lib/teacher/permissions.ts

import { supabase } from '@/lib/supabase/client';

/**
 * Check if a teacher is assigned to a specific class and subject
 */
export async function checkTeacherAssignment(
  teacherId: string,
  classId: string,
  subjectId: string
): Promise<{ authorized: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('class_subjects')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .maybeSingle();

    if (error) {
      console.error('Permission check error:', error);
      return { authorized: false, error: 'Database error' };
    }

    if (!data) {
      return { authorized: false, error: 'Teacher not assigned to this subject' };
    }

    return { authorized: true };
  } catch (err) {
    return { authorized: false, error: 'Permission check failed' };
  }
}

/**
 * Get all class-subject assignments for a teacher
 */
export async function getTeacherAssignments(teacherId: string) {
  const { data, error } = await supabase
    .from('class_subjects')
    .select('class_id, subject_id')
    .eq('teacher_id', teacherId);

  if (error) {
    console.error('Error fetching teacher assignments:', error);
    return null;
  }

  return data;
}