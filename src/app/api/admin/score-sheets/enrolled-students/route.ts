import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";

/**
 * GET /api/admin/score-sheets/enrolled-students?classId=X&termId=Y&subjectId=Z
 *
 * Returns the roster of enrolled students for the class + term, along with:
 *   - the subject teacher's name (pre-fill on the print sheet)
 *   - the assessment max scores for the class + subject + term
 *
 * Used by the print/PDF endpoint to build the sheet.
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requirePaidAdmin();
    if (!guard.authorized) return guard.response;
    const { schoolId } = guard;

    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const termId = searchParams.get("termId");
    const subjectId = searchParams.get("subjectId");

    if (!classId || !termId || !subjectId) {
      return NextResponse.json(
        { error: "classId, termId, subjectId are required" },
        { status: 400 }
      );
    }

    const { data: enrollments, error } = (await supabase
      .from("enrollments")
      .select(
        "student_id, students:student_id(id, full_name, admission_number)"
      )
      .eq("class_id", classId)
      .eq("term_id", termId)
      .eq("is_current", true)) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (error) throw error;

    const students = (enrollments || [])
      .map((e) => {
        const s = Array.isArray(e.students) ? e.students[0] : e.students;
        return s
          ? {
              id: s.id,
              full_name: s.full_name,
              admission_number: s.admission_number,
            }
          : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.full_name.localeCompare(b.full_name));

    const { data: cs } = (await supabase
      .from("class_subjects")
      .select("teacher_id, profiles:teacher_id(full_name)")
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .maybeSingle()) as unknown as { data: any | null };

    const teacherName = cs?.profiles
      ? Array.isArray(cs.profiles)
        ? cs.profiles[0]?.full_name
        : cs.profiles?.full_name
      : null;

    const { data: assessments } = (await supabase
      .from("assessments")
      .select("name, max_score")
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("term_id", termId)
      .eq("is_deleted", false)) as unknown as {
      data: { name: string; max_score: number }[] | null;
    };

    const maxScores = { ca1: 10, ca2: 10, ca3: 10, exam: 70 };
    for (const a of assessments || []) {
      const n = a.name.toUpperCase().trim();
      if (n === "CA1") maxScores.ca1 = a.max_score;
      if (n === "CA2") maxScores.ca2 = a.max_score;
      if (n === "CA3") maxScores.ca3 = a.max_score;
      if (n === "EXAM") maxScores.exam = a.max_score;
    }

    return NextResponse.json({
      success: true,
      data: { students, teacher_name: teacherName, max_scores: maxScores },
    });
  } catch (error: any) {
    console.error("GET /api/admin/score-sheets/enrolled-students error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
