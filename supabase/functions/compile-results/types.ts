// supabase/functions/compile-results/types.ts

/**
 * Job payload received from the database trigger
 */
export interface CompilationJob {
  id: string;
  school_id: string;
  class_id: string;
  term_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
  created_at: string;
}

/**
 * Score record from the scores table
 */
export interface ScoreRecord {
  student_id: string;
  assessment_id: string;
  score: number | null;
}

/**
 * Assessment record with weight and max_score
 */
export interface AssessmentRecord {
  id: string;
  name: string;
  type: 'exam' | 'test' | 'quiz';
  max_score: number;
  weight: number;
  subject_id: string;
}

/**
 * Subject record
 */
export interface SubjectRecord {
  id: string;
  name: string;
  code: string;
}

/**
 * Student record
 */
export interface StudentRecord {
  id: string;
  full_name: string;
  admission_number: string;
}

/**
 * Grading system record
 */
export interface GradingSystemRecord {
  grade: string;
  min_score: number;
  max_score: number;
  remark: string;
}

/**
 * Compiled result for one student + subject
 */
export interface CompiledResultRecord {
  school_id: string;
  student_id: string;
  class_id: string;
  term_id: string;
  subject_id: string;
  score: number;
  grade: string;
  subject_position: number;
  overall_position: number;
  remarks: string;
}

/**
 * Per-student aggregation of subject scores
 */
export interface StudentSubjectAggregate {
  student_id: string;
  subjects: {
    subject_id: string;
    subject_name: string;
    score: number;
    grade: string;
    remarks: string;
  }[];
  overall_average: number;
  overall_grade: string;
  overall_remarks: string;
}

/**
 * Edge Function response
 */
export interface CompilationResponse {
  success: boolean;
  message?: string;
  error?: string;
  stats?: {
    students_processed: number;
    subjects_processed: number;
    total_records: number;
  };
}
