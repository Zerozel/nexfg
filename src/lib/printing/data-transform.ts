import type {
  IndividualReportCardData,
  ClassResultSheetData,
  SubjectResult,
  OverallResult,
  SchoolInfo,
  StudentInfo,
  ClassInfo,
  TermInfo,
  GradingSystem,
} from "@/types/printing";

/**
 * Transforms raw database compiled_results into print-ready data
 */

/**
 * WAEC-style default grading bands, used when a school has not configured
 * a custom grading system.
 */
const DEFAULT_GRADING_SYSTEM: GradingSystem = [
  { grade: "A1", min_score: 80, max_score: 100, remarks: "Excellent" },
  { grade: "B2", min_score: 75, max_score: 79, remarks: "Very Good" },
  { grade: "B3", min_score: 70, max_score: 74, remarks: "Very Good" },
  { grade: "C4", min_score: 65, max_score: 69, remarks: "Good" },
  { grade: "C5", min_score: 60, max_score: 64, remarks: "Good" },
  { grade: "C6", min_score: 55, max_score: 59, remarks: "Credit" },
  { grade: "D7", min_score: 50, max_score: 54, remarks: "Credit" },
  { grade: "E8", min_score: 45, max_score: 49, remarks: "Pass" },
  { grade: "F9", min_score: 0, max_score: 44, remarks: "Fail" },
];

/**
 * Reads a grading system off raw API data. Supports either
 * `rawData.grading_system` or `rawData.school.grading_system`.
 */
function extractGradingSystem(rawData: any): GradingSystem | undefined {
  const candidate =
    rawData?.grading_system ?? rawData?.school?.grading_system;
  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate as GradingSystem;
  }
  return undefined;
}

export function transformStudentReportData(
  rawData: any
): IndividualReportCardData {
  const gradingSystems = extractGradingSystem(rawData);

  const school: SchoolInfo = {
    id: rawData.school?.id || "",
    name: rawData.school?.name || "School Name",
    logo_url: rawData.school?.logo_url || null,
    motto: rawData.school?.motto || null,
    address: rawData.school?.address || null,
    phone: rawData.school?.phone || null,
    email: rawData.school?.email || null,
    primary_color: rawData.school?.primary_color || "#2563eb",
    principal_name: rawData.school?.principal_name || null,
    principal_signature_url:
      rawData.school?.principal_signature_url || null,
  };

  const student: StudentInfo = {
    id: rawData.student?.id || "",
    full_name: rawData.student?.full_name || "Student Name",
    admission_number: rawData.student?.admission_number || null,
    avatar_url: rawData.student?.avatar_url || null,
  };

  const classInfo: ClassInfo = {
    id: rawData.class?.id || "",
    name: rawData.class?.name || "Class",
    teacher_name: rawData.class?.teacher_name || null,
    teacher_id: rawData.class?.teacher_id || null,
  };

  const term: TermInfo = {
    id: rawData.term?.id || "",
    name: rawData.term?.name || "Term",
    academic_session: rawData.term?.academic_session || "",
    start_date: rawData.term?.start_date || null,
    end_date: rawData.term?.end_date || null,
  };

  // Transform compiled results into subject array
  const subjects: SubjectResult[] = Array.isArray(
    rawData.compiled_results?.subjects
  )
    ? rawData.compiled_results.subjects.map((subj: any) => ({
        id: subj.id || subj.subject_id || "",
        name: subj.name || subj.subject_name || "Subject",
        score: typeof subj.score === "number" ? subj.score : 0,
        grade: subj.grade || formatGrade(subj.score, gradingSystems),
        subject_position:
          typeof subj.subject_position === "number"
            ? subj.subject_position
            : null,
        remarks: subj.remarks || getRemarks(subj.score, gradingSystems),
        class_average:
          typeof subj.class_average === "number"
            ? subj.class_average
            : null,
        class_highest:
          typeof subj.class_highest === "number"
            ? subj.class_highest
            : null,
        class_lowest:
          typeof subj.class_lowest === "number"
            ? subj.class_lowest
            : null,
        weight:
          typeof subj.weight === "number" ? subj.weight : null,
      }))
    : [];

  const overall: OverallResult = {
    average:
      typeof rawData.compiled_results?.average === "number"
        ? rawData.compiled_results.average
        : calculateAverage(subjects),
    position:
      typeof rawData.compiled_results?.position === "number"
        ? rawData.compiled_results.position
        : 0,
    total_students:
      typeof rawData.compiled_results?.total_students === "number"
        ? rawData.compiled_results.total_students
        : 0,
    total_subjects: subjects.length,
    grade:
      rawData.compiled_results?.grade ||
      formatGrade(
        typeof rawData.compiled_results?.average === "number"
          ? rawData.compiled_results.average
          : calculateAverage(subjects),
        gradingSystems
      ),
    remarks:
      rawData.compiled_results?.remarks ||
      getRemarks(
        typeof rawData.compiled_results?.average === "number"
          ? rawData.compiled_results.average
          : calculateAverage(subjects),
        gradingSystems
      ),
  };

  return {
    school,
    student,
    class: classInfo,
    term,
    subjects,
    overall,
    issued_date: rawData.issued_date || new Date().toISOString().split("T")[0],
    teacher_comment: rawData.compiled_results?.teacher_comment || null,
    principal_comment: rawData.compiled_results?.principal_comment || null,
    attendance: rawData.attendance || null,
    affective_traits: rawData.affective_traits || null,
    psychomotor_skills: rawData.psychomotor_skills || null,
  };
}

export function transformClassResultData(
  rawData: any
): ClassResultSheetData {
  const gradingSystems = extractGradingSystem(rawData);

  const school: SchoolInfo = {
    id: rawData.school?.id || "",
    name: rawData.school?.name || "School Name",
    logo_url: rawData.school?.logo_url || null,
    motto: rawData.school?.motto || null,
    address: rawData.school?.address || null,
    phone: rawData.school?.phone || null,
    email: rawData.school?.email || null,
    primary_color: rawData.school?.primary_color || "#2563eb",
    principal_name: rawData.school?.principal_name || null,
    principal_signature_url:
      rawData.school?.principal_signature_url || null,
  };

  const classInfo: ClassInfo = {
    id: rawData.class?.id || "",
    name: rawData.class?.name || "Class",
    teacher_name: rawData.class?.teacher_name || null,
    teacher_id: rawData.class?.teacher_id || null,
  };

  const term: TermInfo = {
    id: rawData.term?.id || "",
    name: rawData.term?.name || "Term",
    academic_session: rawData.term?.academic_session || "",
    start_date: rawData.term?.start_date || null,
    end_date: rawData.term?.end_date || null,
  };

  // Extract all unique subject names for column headers
  const subjectsSet = new Set<string>();
  const students = Array.isArray(rawData.students)
    ? rawData.students.map((studentData: any) => {
        const studentSubjects: SubjectResult[] = Array.isArray(
          studentData.subjects
        )
          ? studentData.subjects.map((subj: any) => {
              subjectsSet.add(subj.name || subj.subject_name || "Subject");
              return {
                id: subj.id || subj.subject_id || "",
                name: subj.name || subj.subject_name || "Subject",
                score:
                  typeof subj.score === "number" ? subj.score : 0,
                grade: subj.grade || formatGrade(subj.score, gradingSystems),
                subject_position:
                  typeof subj.subject_position === "number"
                    ? subj.subject_position
                    : null,
                remarks:
                  subj.remarks || getRemarks(subj.score, gradingSystems),
                class_average:
                  typeof subj.class_average === "number"
                    ? subj.class_average
                    : null,
                class_highest:
                  typeof subj.class_highest === "number"
                    ? subj.class_highest
                    : null,
                class_lowest:
                  typeof subj.class_lowest === "number"
                    ? subj.class_lowest
                    : null,
                weight:
                  typeof subj.weight === "number" ? subj.weight : null,
              };
            })
          : [];

        const studentOverall: OverallResult = {
          average:
            typeof studentData.average === "number"
              ? studentData.average
              : calculateAverage(studentSubjects),
          position:
            typeof studentData.position === "number"
              ? studentData.position
              : 0,
          total_students:
            typeof studentData.total_students === "number"
              ? studentData.total_students
              : rawData.students?.length || 0,
          total_subjects: studentSubjects.length,
          grade:
            studentData.grade ||
            formatGrade(
              typeof studentData.average === "number"
                ? studentData.average
                : calculateAverage(studentSubjects),
              gradingSystems
            ),
          remarks:
            studentData.remarks ||
            getRemarks(
              typeof studentData.average === "number"
                ? studentData.average
                : calculateAverage(studentSubjects),
              gradingSystems
            ),
        };

        return {
          student: {
            id: studentData.student?.id || "",
            full_name:
              studentData.student?.full_name || "Student Name",
            admission_number:
              studentData.student?.admission_number || null,
            avatar_url: studentData.student?.avatar_url || null,
          },
          subjects: studentSubjects,
          overall: studentOverall,
          attendance: studentData.attendance || null,
        };
      })
    : [];

  // Sort students by position
  students.sort((a: any, b: any) => a.overall.position - b.overall.position);

  const allAverages = students.map((s: any) => s.overall.average);
  const classAverage =
    allAverages.length > 0
      ? allAverages.reduce((sum: number, avg: number) => sum + avg, 0) /
        allAverages.length
      : 0;
  const classHighest =
    allAverages.length > 0 ? Math.max(...allAverages) : 0;
  const classLowest =
    allAverages.length > 0 ? Math.min(...allAverages) : 0;

  return {
    school,
    class: classInfo,
    term,
    subjects: Array.from(subjectsSet).sort(),
    students,
    issued_date:
      rawData.issued_date || new Date().toISOString().split("T")[0],
    class_average: Math.round(classAverage * 100) / 100,
    class_highest: Math.round(classHighest * 100) / 100,
    class_lowest: Math.round(classLowest * 100) / 100,
  };
}

/**
 * Utility functions for grading
 */

/**
 * Weighted average of subject scores. Each subject may carry a `weight`;
 * when omitted the weight defaults to 1, so this reduces to a simple mean
 * for data that has no weighting configured (backward compatible).
 */
export function calculateAverage(subjects: SubjectResult[]): number {
  if (subjects.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;
  for (const subj of subjects) {
    const weight =
      typeof subj.weight === "number" && subj.weight > 0 ? subj.weight : 1;
    weightedSum += subj.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Assigns a letter grade (e.g. A1–F9) for a score. Uses the supplied
 * `gradingSystems` bands when provided, otherwise WAEC defaults.
 */
export function formatGrade(
  score: number,
  gradingSystems?: GradingSystem
): string {
  const safeScore = typeof score === "number" ? score : 0;
  const bands = gradingSystems?.length ? gradingSystems : DEFAULT_GRADING_SYSTEM;

  const band = bands.find(
    (b) => safeScore >= b.min_score && safeScore <= b.max_score
  );

  if (band) return band.grade;

  // Fall back to the lowest band's grade when nothing matches.
  return bands[bands.length - 1]?.grade || "F9";
}

/**
 * Returns the remark associated with a score, using the school's grading
 * bands when available, otherwise WAEC-style defaults.
 */
export function getRemarks(
  score: number,
  gradingSystems?: GradingSystem
): string {
  const safeScore = typeof score === "number" ? score : 0;
  const bands = gradingSystems?.length ? gradingSystems : DEFAULT_GRADING_SYSTEM;

  const band = bands.find(
    (b) => safeScore >= b.min_score && safeScore <= b.max_score
  );

  if (band?.remarks) return band.remarks;

  // Default remark fallbacks (used when a custom band omits remarks).
  if (safeScore >= 80) return "Excellent";
  if (safeScore >= 70) return "Very Good";
  if (safeScore >= 60) return "Good";
  if (safeScore >= 50) return "Credit";
  if (safeScore >= 45) return "Pass";
  return "Fail";
}

/**
 * Maps a letter grade to a CSS class used for grade-color styling.
 * Shared by ReportCardTemplate and ClassResultSheet so the A1–F9 palette
 * is applied consistently.
 */
export function getGradeClass(grade: string | null | undefined): string {
  if (!grade) return "";
  const g = grade.trim().toUpperCase();

  if (/^(A1|B2|B3)/.test(g)) return "grade-a1";
  if (/^(C4|C5|C6)/.test(g)) return "grade-c4";
  if (/^(D7|E8)/.test(g)) return "grade-d7";
  if (/^F9/.test(g)) return "grade-f9";

  // Fallback for single-letter grades (A/B/C/D/E/F)
  const first = g.charAt(0);
  if (first === "A" || first === "B") return "grade-a1";
  if (first === "C") return "grade-c4";
  if (first === "D" || first === "E") return "grade-d7";
  if (first === "F") return "grade-f9";
  return "";
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getOrdinal(n: number): string {
  // Guard against missing/zero positions (e.g. uncompiled results).
  if (!Number.isFinite(n) || n <= 0) return "-";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
