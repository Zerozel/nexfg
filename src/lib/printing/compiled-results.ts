// src/lib/printing/compiled-results.ts
//
// Adapts the *real* `compiled_results` table (one row per student-subject)
// into the per-student aggregate shape the report-card API routes and the
// printing templates consume.
//
// Session 6 added four raw per-assessment columns to `compiled_results`:
//   ca1_score, ca2_score, ca3_score, exam_score
// These flow through untouched so the report card can render the breakdown.

type SupabaseClient = any;

export interface AggregatedSubjectResult {
  id: string;
  subject_id: string;
  name: string;
  score: number;
  grade: string | null;
  subject_position: number | null;
  remarks: string | null;
  /** Raw scores. Null when the source row predates Session 6. */
  ca1_score: number | null;
  ca2_score: number | null;
  ca3_score: number | null;
  exam_score: number | null;
}

export interface AggregatedStudentResult {
  student_id: string;
  subjects: AggregatedSubjectResult[];
  average: number;
  position: number;
  total_students: number;
  grade: string | null;
  remarks: string | null;
  updated_at: string | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Fetches compiled results for a class + term (optionally restricted to a set
 * of students) and groups the per-subject rows into one aggregate per student.
 */
export async function fetchCompiledResultsByStudent(
  supabase: SupabaseClient,
  params: { classId: string; termId: string; studentIds?: string[] }
): Promise<Map<string, AggregatedStudentResult>> {
  const { classId, termId, studentIds } = params;

  let query = supabase
    .from("compiled_results")
    .select(
      "student_id, subject_id, score, grade, subject_position, overall_position, remarks, updated_at, ca1_score, ca2_score, ca3_score, exam_score, subjects:subject_id(name)"
    )
    .eq("class_id", classId)
    .eq("term_id", termId);

  if (studentIds && studentIds.length > 0) {
    query = query.in("student_id", studentIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data || []) as any[];
  const grouped = new Map<string, AggregatedStudentResult>();

  for (const row of rows) {
    const sid = row.student_id as string;
    let agg = grouped.get(sid);
    if (!agg) {
      agg = {
        student_id: sid,
        subjects: [],
        average: 0,
        position:
          typeof row.overall_position === "number" ? row.overall_position : 0,
        total_students: 0,
        grade: null,
        remarks: null,
        updated_at: row.updated_at || null,
      };
      grouped.set(sid, agg);
    }

    const subjectName = Array.isArray(row.subjects)
      ? row.subjects[0]?.name
      : row.subjects?.name;

    const asNumber = (v: any): number | null =>
      v === null || v === undefined ? null : Number(v);

    agg.subjects.push({
      id: row.subject_id,
      subject_id: row.subject_id,
      name: subjectName || "Subject",
      score:
        typeof row.score === "number" ? Number(row.score) : Number(row.score) || 0,
      grade: row.grade ?? null,
      subject_position:
        typeof row.subject_position === "number" ? row.subject_position : null,
      remarks: row.remarks ?? null,
      ca1_score: asNumber(row.ca1_score),
      ca2_score: asNumber(row.ca2_score),
      ca3_score: asNumber(row.ca3_score),
      exam_score: asNumber(row.exam_score),
    });

    if (typeof row.overall_position === "number" && !agg.position) {
      agg.position = row.overall_position;
    }
    if (row.updated_at && (!agg.updated_at || row.updated_at > agg.updated_at)) {
      agg.updated_at = row.updated_at;
    }
  }

  const totalStudents = grouped.size;
  for (const agg of Array.from(grouped.values())) {
    const scores = agg.subjects.map((s) => s.score);
    agg.average =
      scores.length > 0
        ? round2(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    agg.total_students = totalStudents;
  }

  return grouped;
}
