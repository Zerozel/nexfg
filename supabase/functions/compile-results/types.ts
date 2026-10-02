// supabase/functions/compile-results/types.ts

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

export interface ScoreRecord {
  student_id: string;
  assessment_id: string;
  score: number | null;
}

export interface AssessmentRecord {
  id: string;
  name: string;
  type: 'exam' | 'test' | 'quiz';
  max_score: number;
  weight: number;
  subject_id: string;
}

export interface SubjectRecord {
  id: string;
  name: string;
  code: string;
}

export interface StudentRecord {
  id: string;
  full_name: string;
  admission_number: string;
}

export interface GradingSystemRecord {
  grade: string;
  min_score: number;
  max_score: number;
  remark: string;
}

/**
 * Compiled result for one student + subject.
 * `score` is the weighted aggregate (0–100).
 * `ca1_score`, `ca2_score`, `ca3_score`, `exam_score` are the raw scores
 * for each assessment slot; missing scores are forced to 0 so totals and
 * report cards stay consistent.
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
  ca1_score: number;
  ca2_score: number;
  ca3_score: number;
  exam_score: number;
}

export interface StudentSubjectAggregate {
  student_id: string;
  subjects: {
    subject_id: string;
    subject_name: string;
    score: number;
    grade: string;
    remarks: string;
    ca1_score: number;
    ca2_score: number;
    ca3_score: number;
    exam_score: number;
  }[];
  overall_average: number;
  overall_grade: string;
  overall_remarks: string;
}

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
