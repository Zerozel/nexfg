// types/index.ts

// ─── Auth & User ───────────────────────────────────
export type UserRole = "super_admin" | "admin" | "principal" | "teacher";

export interface AppMetadata {
  role: UserRole;
  school_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  school_id: string;
  avatar_url?: string;
  created_at: string;
}

// ─── School ────────────────────────────────────────
export interface School {
  id: string;
  name: string;
  subdomain: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  is_active: boolean;
  created_at: string;
}

// ─── Class ─────────────────────────────────────────
export interface Class {
  id: string;
  name: string;
  grade_level: number;
  section?: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  academic_year: string;
  created_at: string;
}

// ─── Student ───────────────────────────────────────
export interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  school_id: string;
  class_id: string;
  is_active: boolean;
  created_at: string;
}

// ─── Assessment ────────────────────────────────────
export type AssessmentType =
  | "exam"
  | "test"
  | "quiz"
  | "assignment"
  | "project"
  | "participation";

export interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  max_score: number;
  weight: number;
  class_id: string;
  subject_id: string;
  term: number;
  academic_year: string;
  created_at: string;
}

// ─── Scores ────────────────────────────────────────
export interface Score {
  id: string;
  student_id: string;
  assessment_id: string;
  score: number | null;
  graded_by: string;
  graded_at: string;
  synced: boolean;
}

export interface PendingScore {
  id?: string;                        // ← ADD (Session 4 UUID for tracking)
  student_id: string;
  assessment_id: string;
  score: number | null;
  synced: boolean;
  updated_at: string;
  sync_attempts?: number;            // ← ADD (retry counter)
  last_sync_error?: string;          // ← ADD (error message from last attempt)
}

export interface ClassScoreCache {
  class_id: string;
  scores: PendingScore[];
  last_updated: string;
}

export interface BulkScorePayload {
  scores: {
    student_id: string;
    assessment_id: string;
    score: number | null;
  }[];
}

export interface SyncResponse {
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  errors: SyncError[];
}

export interface SyncError {
  index: number;
  student_id: string;
  assessment_id: string;
  reason: string;
}

// ─── Sync Status ───────────────────────────────────
export type SyncStatus = "idle" | "syncing" | "offline" | "error" | "synced";

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncTime: string | null;
  error?: string;
}

// ─── Navigation ────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles: UserRole[];
}

// ─── Form States ───────────────────────────────────
export interface LoginFormState {
  email: string;
  password: string;
  role: UserRole | "";
  error: string;
  loading: boolean;
}

export interface ScoreCellState {
  isFocused: boolean;
  isDirty: boolean;
  isValid: boolean;
  localValue: string;
}
