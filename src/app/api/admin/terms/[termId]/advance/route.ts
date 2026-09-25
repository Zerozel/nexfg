import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/supabase/school-admin-auth";

/**
 * Advance the current term to the next one in the same academic year.
 *
 * Effects (in a single logical transaction):
 *   1. Marks the current term is_current = false
 *   2. Marks the next term (by `order`) is_current = true
 *   3. For every active enrollment in the current term, creates a matching
 *      enrollment in the next term with the same class_id — so students
 *      "carry forward" into the new term automatically.
 *
 * Idempotent: re-running against an already-advanced term is a no-op for the
 * enrollment copy (the unique constraint prevents duplicates), but we still
 * guard against double-advancing by requiring the input termId to be the
 * current term.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ termId: string }> }
) {
  try {
    const { termId } = await params;

    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    // 1. Load the source term, verify it belongs to this school and is current
    const { data: currentTerm, error: termError } = await supabase
      .from("terms")
      .select("id, name, \"order\", academic_year_id, is_current, is_deleted")
      .eq("id", termId)
      .eq("school_id", schoolId)
      .maybeSingle();

    if (termError) throw termError;
    if (!currentTerm) {
      return NextResponse.json(
        { error: "Term not found" },
        { status: 404 }
      );
    }
    if (currentTerm.is_deleted) {
      return NextResponse.json(
        { error: "Term is deleted" },
        { status: 400 }
      );
    }
    if (!currentTerm.is_current) {
      return NextResponse.json(
        { error: "This is not the current term. Nothing to advance." },
        { status: 400 }
      );
    }

    // 2. Find the next term in the same academic year
    const { data: nextTerm, error: nextError } = await supabase
      .from("terms")
      .select("id, name, \"order\"")
      .eq("academic_year_id", currentTerm.academic_year_id)
      .eq("school_id", schoolId)
      .gt("order", currentTerm.order)
      .is("is_deleted", false)
      .order("order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextError) throw nextError;
    if (!nextTerm) {
      return NextResponse.json(
        {
          error:
            "No next term exists in this academic year. Create the next academic year and promote students instead.",
        },
        { status: 400 }
      );
    }

    // 3. Load all active enrollments in the current term
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("student_id, class_id")
      .eq("school_id", schoolId)
      .eq("term_id", currentTerm.id)
      .eq("is_current", true)
      .eq("is_deleted", false);

    if (enrollmentsError) throw enrollmentsError;

    // 4. Flip the current flags.
    //    The partial unique index on (academic_year_id) WHERE is_current = true
    //    guarantees only one current term per year — so we must clear the old
    //    term before setting the new one.
    const { error: clearError } = await supabase
      .from("terms")
      .update({ is_current: false, updated_at: new Date().toISOString() })
      .eq("id", currentTerm.id);

    if (clearError) throw clearError;

    const { error: setError } = await supabase
      .from("terms")
      .update({ is_current: true, updated_at: new Date().toISOString() })
      .eq("id", nextTerm.id);

    if (setError) throw setError;

    // 5. Carry forward enrollments. Insert with ignore-duplicates semantics
    //    because the unique (student_id, term_id) constraint means some may
    //    already exist if the advance was partially run before.
    let carried = 0;
    if (enrollments && enrollments.length > 0) {
      const rows = enrollments.map((e: any) => ({
        student_id: e.student_id,
        class_id: e.class_id,
        term_id: nextTerm.id,
        enrollment_date: new Date().toISOString().split("T")[0],
        is_current: true,
      }));

      // Fetch existing enrollments in the target term so we skip them.
      const { data: existingNext, error: existingError } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("term_id", nextTerm.id)
        .in("student_id", rows.map((r) => r.student_id));

      if (existingError) throw existingError;

      const existingSet = new Set(
        (existingNext || []).map((e: any) => e.student_id)
      );
      const toInsert = rows.filter((r) => !existingSet.has(r.student_id));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("enrollments")
          .insert(toInsert);

        if (insertError) throw insertError;
        carried = toInsert.length;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        from_term: { id: currentTerm.id, name: currentTerm.name },
        to_term: { id: nextTerm.id, name: nextTerm.name },
        students_carried_forward: carried,
        total_current_students: enrollments?.length || 0,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/terms/[termId]/advance error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
