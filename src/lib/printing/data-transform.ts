import type {
  IndividualReportCardData,
  ClassResultSheetData,
  SubjectResult,
  OverallResult,
  SchoolInfo,
  StudentInfo,
  ClassInfo,
  TermInfo,
} from "@/types/printing";

/**
 * Transforms raw database compiled_results into print-ready data
 */

export function transformStudentReportData(
  rawData: any
): IndividualReportCardData {
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
        grade: subj.grade || formatGrade(subj.score),
        subject_position:
          typeof subj.subject_position === "number"
            ? subj.subject_position
            : null,
        remarks: subj.remarks || getRemarks(subj.score),
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
          : calculateAverage(subjects)
      ),
    remarks:
      rawData.compiled_results?.remarks ||
      getRemarks(
        typeof rawData.compiled_results?.average === "number"
          ? rawData.compiled_results.average
          : calculateAverage(subjects)
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
                grade: subj.grade || formatGrade(subj.score),
                subject_position:
                  typeof subj.subject_position === "number"
                    ? subj.subject_position
                    : null,
                remarks: subj.remarks || getRemarks(subj.score),
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
                : calculateAverage(studentSubjects)
            ),
          remarks:
            studentData.remarks ||
            getRemarks(
              typeof studentData.average === "number"
                ? studentData.average
                : calculateAverage(studentSubjects)
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

export function calculateAverage(subjects: SubjectResult[]): number {
  if (subjects.length === 0) return 0;
  const sum = subjects.reduce((acc, subj) => acc + subj.score, 0);
  return Math.round((sum / subjects.length) * 100) / 100;
}

export function formatGrade(score: number): string {
  if (score >= 80) return "A1";
  if (score >= 75) return "B2";
  if (score >= 70) return "B3";
  if (score >= 65) return "C4";
  if (score >= 60) return "C5";
  if (score >= 55) return "C6";
  if (score >= 50) return "D7";
  if (score >= 45) return "E8";
  return "F9";
}

export function getRemarks(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Credit";
  if (score >= 45) return "Pass";
  return "Fail";
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
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
