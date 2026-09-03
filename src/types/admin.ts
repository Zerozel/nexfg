// src/types/admin.ts

export interface Student {
  id: string;
  school_id: string;
  full_name: string;
  admission_number: string;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  address?: string | null;
  enrollment_year: number;
  class_id?: string | null;
  class_name?: string | null;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  full_name: string;
  email: string;
  role: 'teacher' | 'admin' | 'principal';
  avatar_url: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherWithCredentials extends Teacher {
  temporary_password: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  academic_year_id: string;
  academic_year_name?: string | null;
  teacher_id: string | null;
  teacher_name?: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}


export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassSubjectAssignment {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Add to existing src/types/admin.ts

export interface Assessment {
  id: string;
  school_id: string;
  name: string;
  type: 'exam' | 'test' | 'quiz';
  term_id: string;
  class_id: string;
  subject_id: string;
  max_score: number;
  weight: number;
  date: string | null;
  class_name?: string;
  subject_name?: string;
  term_name?: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_id: string;
  term_id: string;
  enrollment_date: string;
  is_current: boolean;
}

export interface TeacherAssignment {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  subject_name?: string;
  teacher_name?: string;
  class_name?: string;
}

export interface BulkEnrollmentResult {
  enrolled: number;
  failed: number;
  errors: { student_id?: string; admission_number?: string; reason: string }[];
}

export interface UnenrolledStudent {
  id: string;
  full_name: string;
  admission_number: string;
}
