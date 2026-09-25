import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/supabase/school-admin-auth";

/**
 * Advance the current term to the next one in the same academic year.
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

    // 1. Load the source term
    const { data: currentTerm, error: termError } = await supabase
      .from("terms")
      .select('id, name, "order", academic_year_id, is_current, is_deleted')
      .eq("id", termId)
      .eq("school_id", schoolId)
      .maybeSingle();

    if (termError) throw termError;
    if (!currentTerm) {
      return NextResponse.json({ error: "Term not found" }, { status: 404 });
    }
    if (currentTerm.is_deleted) {
      return NextResponse.json({ error: "Term is deleted" }, { status: 400 });
    }
    if (!currentTerm.is_current) {
      return NextResponse.json(
        { error: "This is not the current term. Nothing to advance." },
        { status: 400 }
      );
    }

    // 2. Find the next term. Fetch all terms for the year and pick the next
    //    by order in JS — chaining .gt("order") with .order("order") breaks
    //    Supabase's query parser because `order` is a reserved word.
    const { data: allTerms, error: allTermsError } = await supabase
      .from("terms")
      .select('id, name, "order"')
      .eq("academic_year_id", currentTerm.academic_year_id)
      .eq("school_id", schoolId)
      .is("is_deleted", false);

    if (allTermsError) throw allTermsError;

    const nextTerm =
      (allTerms || [])
        .filter((t: any) => t.order > currentTerm.order)
        .sort((a: any, b: any) => a.order - b.order)[0] || null;

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

    // 5. Carry forward enrollments.
    let carried = 0;
    if (enrollments && enrollments.length > 0) {
      const rows = enrollments.map((e: any) => ({
        student_id: e.student_id,
        class_id: e.class_id,
        term_id: nextTerm.id,
        enrollment_date: new Date().toISOString().split("T")[0],
        is_current: true,
      }));

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
