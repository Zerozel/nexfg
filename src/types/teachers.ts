// src/types/teacher.ts

export interface TeacherSubject {
  id: string;
  name: string;
  code: string;
  assessments_count?: number;
}

export interface TeacherClass {
  id: string;
  name: string;
  academic_year_id: string;
  subjects: TeacherSubject[];
}

export interface TeacherClassResponse {
  success: boolean;
  data: TeacherClass[];
}

export interface Assessment {
  id: string;
  name: string;
  type: 'exam' | 'test' | 'quiz';
  max_score: number;
  weight: number;
  class_id: string;
  subject_id: string;
  term_id: string;
}

export interface StudentScore {
  id: string;
  full_name: string;
  admission_number: string;
  scores: Record<string, number | null>;
}

export interface AssessmentDataResponse {
  success: boolean;
  data: {
    assessments: Assessment[];
    students: StudentScore[];
    term: {
      id: string;
      name: string;
    };
  };
}

export interface BulkScoreRequest {
  class_id: string;
  subject_id: string;
  term_id: string;
  scores: {
    student_id: string;
    assessment_id: string;
    score: number | null;
  }[];
}

export interface BulkScoreResponse {
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  errors: {
    student_id?: string;
    reason: string;
  }[];
}