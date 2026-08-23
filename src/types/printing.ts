// Print-related types for report cards and result sheets

export interface SchoolInfo {
  id: string;
  name: string;
  logo_url: string | null;
  motto: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  primary_color: string | null;
  principal_name: string | null;
  principal_signature_url: string | null;
}

export interface StudentInfo {
  id: string;
  full_name: string;
  admission_number: string | null;
  avatar_url: string | null;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher_name: string | null;
  teacher_id: string | null;
}

export interface TermInfo {
  id: string;
  name: string;
  academic_session: string;
  start_date: string | null;
  end_date: string | null;
}

export interface SubjectResult {
  id: string;
  name: string;
  score: number;
  grade: string;
  subject_position: number | null;
  remarks: string | null;
  class_average: number | null;
  class_highest: number | null;
  class_lowest: number | null;
  /** Relative weight used for weighted-average calculation. Defaults to 1. */
  weight?: number | null;
}

/**
 * A single band within a school's grading system, e.g.
 * { grade: "A1", min_score: 80, max_score: 100, remarks: "Excellent" }.
 */
export interface GradingBand {
  grade: string;
  min_score: number;
  max_score: number;
  remarks: string | null;
  color?: string | null;
}

/** An ordered list of grading bands. When absent, WAEC defaults are used. */
export type GradingSystem = GradingBand[];


export interface OverallResult {
  average: number;
  position: number;
  total_students: number;
  total_subjects: number;
  grade: string | null;
  remarks: string | null;
}

export interface IndividualReportCardData {
  school: SchoolInfo;
  student: StudentInfo;
  class: ClassInfo;
  term: TermInfo;
  subjects: SubjectResult[];
  overall: OverallResult;
  issued_date: string;
  teacher_comment: string | null;
  principal_comment: string | null;
  attendance?: {
    total_days: number;
    present: number;
    absent: number;
  } | null;
  affective_traits?: {
    trait: string;
    rating: string;
  }[] | null;
  psychomotor_skills?: {
    skill: string;
    rating: string;
  }[] | null;
}

export interface ClassStudentResult {
  student: StudentInfo;
  subjects: SubjectResult[];
  overall: OverallResult;
  attendance?: {
    total_days: number;
    present: number;
    absent: number;
  } | null;
}

export interface ClassResultSheetData {
  school: SchoolInfo;
  class: ClassInfo;
  term: TermInfo;
  subjects: string[]; // Subject names for column headers
  students: ClassStudentResult[];
  issued_date: string;
  class_average: number;
  class_highest: number;
  class_lowest: number;
}

export interface BatchPrintData {
  school: SchoolInfo;
  class: ClassInfo;
  term: TermInfo;
  students: IndividualReportCardData[];
}

export interface ClassesDropdownData {
  classes: {
    id: string;
    name: string;
    student_count: number;
    teacher_id: string | null;
    teacher_name: string | null;
  }[];
  terms: {
    id: string;
    name: string;
    academic_session: string;
    is_current: boolean;
  }[];
}

export interface PrintPermissions {
  canPrint: boolean;
  reason?: string;
  allowedClasses: string[];
  role: string;
}
