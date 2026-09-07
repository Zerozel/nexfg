// supabase/functions/compile-results/database.ts

// ✅ FIX: Correct Deno import (remove .ts extension)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import {
  CompilationJob,
  ScoreRecord,
  AssessmentRecord,
  SubjectRecord,
  StudentRecord,
  GradingSystemRecord,
  CompiledResultRecord,
} from './types';

/**
 * Create Supabase client with service role key
 */
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Get job details
 */
export async function getJob(
  supabase: any,
  jobId: string
): Promise<CompilationJob | null> {
  const { data, error } = await supabase
    .from('compilation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }

  return data;
}

/**
 * Update job status
 */
export async function updateJobStatus(
  supabase: any,
  jobId: string,
  status: 'processing' | 'completed' | 'failed',
  progress: number,
  errorMessage?: string
): Promise<void> {
  const updateData: any = {
    status,
    progress,
    updated_at: new Date().toISOString(),
  };

  if (status === 'processing') {
    updateData.started_at = new Date().toISOString();
  }

  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('compilation_jobs')
    .update(updateData)
    .eq('id', jobId);

  if (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
}

/**
 * Get scores for a class and term
 */
export async function getScores(
  supabase: any,
  classId: string,
  termId: string
): Promise<ScoreRecord[]> {
  // Get all assessment IDs for this class + term
  const { data: assessments, error: assessmentError } = await supabase
    .from('assessments')
    .select('id')
    .eq('class_id', classId)
    .eq('term_id', termId)
    .is('is_deleted', false);

  if (assessmentError) {
    console.error('Error fetching assessments:', assessmentError);
    throw assessmentError;
  }

  if (!assessments || assessments.length === 0) {
    return [];
  }

  const assessmentIds = assessments.map((a: any) => a.id);

  // Get all scores for those assessments
  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select('student_id, assessment_id, score')
    .in('assessment_id', assessmentIds);

  if (scoresError) {
    console.error('Error fetching scores:', scoresError);
    throw scoresError;
  }

  return scores || [];
}

/**
 * Get assessments for a class and term
 */
export async function getAssessments(
  supabase: any,
  classId: string,
  termId: string
): Promise<AssessmentRecord[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('id, name, type, max_score, weight, subject_id')
    .eq('class_id', classId)
    .eq('term_id', termId)
    .is('is_deleted', false);

  if (error) {
    console.error('Error fetching assessments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get subjects for a school
 */
export async function getSubjects(
  supabase: any,
  schoolId: string
): Promise<SubjectRecord[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code')
    .eq('school_id', schoolId)
    .is('is_deleted', false);

  if (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get students in a class
 */
export async function getStudents(
  supabase: any,
  classId: string
): Promise<StudentRecord[]> {
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, admission_number')
    .eq('class_id', classId)
    .is('is_deleted', false)
    .order('full_name');

  if (error) {
    console.error('Error fetching students:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get grading system for a school
 */
export async function getGradingSystem(
  supabase: any,
  schoolId: string
): Promise<GradingSystemRecord[]> {
  const { data, error } = await supabase
    .from('grading_systems')
    .select('grade, min_score, max_score, remark')
    .eq('school_id', schoolId)
    .order('min_score', { ascending: false });

  if (error) {
    console.error('Error fetching grading system:', error);
    // Fall back to WAEC defaults
    return [
      { grade: 'A1', min_score: 80, max_score: 100, remark: 'Excellent' },
      { grade: 'B2', min_score: 75, max_score: 79, remark: 'Very Good' },
      { grade: 'B3', min_score: 70, max_score: 74, remark: 'Very Good' },
      { grade: 'C4', min_score: 65, max_score: 69, remark: 'Good' },
      { grade: 'C5', min_score: 60, max_score: 64, remark: 'Good' },
      { grade: 'C6', min_score: 55, max_score: 59, remark: 'Credit' },
      { grade: 'D7', min_score: 50, max_score: 54, remark: 'Credit' },
      { grade: 'E8', min_score: 45, max_score: 49, remark: 'Pass' },
      { grade: 'F9', min_score: 0, max_score: 44, remark: 'Fail' },
    ];
  }

  return data || [];
}

/**
 * Check if compiled results already exist for this class + term
 */
export async function hasCompiledResults(
  supabase: any,
  classId: string,
  termId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('compiled_results')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .eq('term_id', termId);

  if (error) {
    console.error('Error checking compiled results:', error);
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Delete existing compiled results for a class + term
 */
export async function deleteCompiledResults(
  supabase: any,
  classId: string,
  termId: string
): Promise<void> {
  const { error } = await supabase
    .from('compiled_results')
    .delete()
    .eq('class_id', classId)
    .eq('term_id', termId);

  if (error) {
    console.error('Error deleting compiled results:', error);
    throw error;
  }
}

/**
 * Insert compiled results
 */
export async function insertCompiledResults(
  supabase: any,
  results: CompiledResultRecord[]
): Promise<void> {
  if (results.length === 0) return;

  const { error } = await supabase
    .from('compiled_results')
    .insert(results);

  if (error) {
    console.error('Error inserting compiled results:', error);
    throw error;
  }
}
