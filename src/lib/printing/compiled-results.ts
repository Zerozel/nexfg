// src/lib/printing/compiled-results.ts
//
// Adapts the *real* `compiled_results` table (one row per student-subject:
// { student_id, class_id, term_id, subject_id, score, grade, subject_position,
//   overall_position, remarks, updated_at }) into the per-student aggregate
// shape the report-card API routes and the printing templates consume
// ({ subjects: [...], average, position, total_students, grade, remarks }).
//
// Centralised here so the student / class / batch routes stay consistent.

// The server Supabase client is created via `createServerSupabase()` which is
// async and loosely typed; mirror the `any` alias used elsewhere in the app.
type SupabaseClient = any;

export interface AggregatedSubjectResult {
  /** Kept as both `id` and `subject_id` so downstream transforms (which read
   *  either) work without special-casing. */
  id: string;
  subject_id: string;
  name: string;
  score: number;
  grade: string | null;
  subject_position: number | null;
  remarks: string | null;
}

export interface AggregatedStudentResult {
  student_id: string;
  subjects: AggregatedSubjectResult[];
  /** Simple mean of subject scores (rounded to 2dp). Downstream transforms may
   *  recompute a weighted average; this is a sensible default. */
  average: number;
  /** Student's overall class position (compiled_results.overall_position). */
  position: number;
  /** Number of students in the class/term who have compiled results. Filled by
   *  {@link fetchCompiledResultsByStudent}; callers may override. */
  total_students: number;
  /** Overall grade/remarks are not stored at student level in the real schema;
   *  left null so the print transform derives them from `average`. */
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
 *
 * Returns a Map keyed by `student_id`. `total_students` is set to the number of
 * distinct students that have compiled results for the class/term across the
 * *returned* rows; when a `studentIds` filter is supplied and you need the full
 * class size, pass it explicitly to the caller instead.
 */
export async function fetchCompiledResultsByStudent(
  supabase: SupabaseClient,
  params: { classId: string; termId: string; studentIds?: string[] }
): Promise<Map<string, AggregatedStudentResult>> {
  const { classId, termId, studentIds } = params;

  let query = supabase
    .from("compiled_results")
    .select(
      "student_id, subject_id, score, grade, subject_position, overall_position, remarks, updated_at, subjects:subject_id(name)"
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

    // `subjects` embed comes back as an object (to-one FK) but be defensive.
    const subjectName = Array.isArray(row.subjects)
      ? row.subjects[0]?.name
      : row.subjects?.name;

    agg.subjects.push({
      id: row.subject_id,
      subject_id: row.subject_id,
      name: subjectName || "Subject",
      score: typeof row.score === "number" ? Number(row.score) : Number(row.score) || 0,
      grade: row.grade ?? null,
      subject_position:
        typeof row.subject_position === "number" ? row.subject_position : null,
      remarks: row.remarks ?? null,
    });

    // overall_position is repeated across a student's subject rows; keep the
    // first defined value.
    if (typeof row.overall_position === "number" && !agg.position) {
      agg.position = row.overall_position;
    }
    // Track the most recent updated_at for issued_date purposes.
    if (row.updated_at && (!agg.updated_at || row.updated_at > agg.updated_at)) {
      agg.updated_at = row.updated_at;
    }
  }

  // Compute a simple mean per student, and set total_students to the number of
  // distinct students represented.
  const totalStudents = grouped.size;
  for (const agg of Array.from(grouped.values())) {
    const scores = agg.subjects.map((s: AggregatedSubjectResult) => s.score);
    agg.average =
      scores.length > 0
        ? round2(
            scores.reduce((a: number, b: number) => a + b, 0) / scores.length
          )
        : 0;
    agg.total_students = totalStudents;
  }

  return grouped;
}
