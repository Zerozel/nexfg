// supabase/functions/scores-bulk/types.ts

export interface ScoreEntry {
  student_id: string;
  assessment_id: string;
  score: number | null;
}

export interface BulkScoresRequest {
  scores: ScoreEntry[];
}

export interface ValidationError {
  index: number;
  student_id: string;
  assessment_id: string;
  reason: string;
}

export interface ValidatedRecord {
  index: number;
  student_id: string;
  assessment_id: string;
  score: number | null;
}

export interface ValidationResult {
  valid: ValidatedRecord[];
  failed: ValidationError[];
}

export interface UpsertResult {
  id: string;
  student_id: string;
  assessment_id: string;
  is_insert: boolean;
}

export interface SuccessResponse {
  success: true;
  inserted: number;
  updated: number;
  failed: number;
  total: number;
  errors: ValidationError[];
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// Database row types
export interface StudentRow {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface AssessmentRow {
  id: string;
  max_score: number;
}
