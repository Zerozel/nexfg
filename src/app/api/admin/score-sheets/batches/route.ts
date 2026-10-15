import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";

/**
 * GET  /api/admin/score-sheets/batches
 *   Lists all batches for the caller's school.
 *
 * POST /api/admin/score-sheets/batches
 *   body: { class_id, subject_id, term_id }
 *   Creates a new batch. The teacher_id is resolved from class_subjects.
 *
 *   Rejects if a non-discarded batch already exists for the same
 *   (class, subject, term) — otherwise two live batches would compete
 *   for the same set of scores.
 */
export async function GET(_request: NextRequest) {
  try {
    const guard = await requirePaidAdmin();
    if (!guard.authorized) return guard.response;
    const { schoolId } = guard;

    const supabase = await createServerSupabase();

    const { data, error } = (await supabase
      .from("score_sheet_batches")
      .select(
        `
        id,
        class_id,
        subject_id,
        term_id,
        teacher_id,
        status,
        created_at,
        confirmed_at,
        classes:class_id(name),
        subjects:subject_id(name),
        terms:term_id(name),
        profiles:teacher_id(full_name)
      `
      )
      .eq("school_id", schoolId)
      .neq("status", "discarded")
      .order("created_at", { ascending: false })) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (error) throw error;

    const list = (data || []).map((b) => ({
      id: b.id,
      class_id: b.class_id,
      class_name: Array.isArray(b.classes)
        ? b.classes[0]?.name
        : b.classes?.name,
      subject_id: b.subject_id,
      subject_name: Array.isArray(b.subjects)
        ? b.subjects[0]?.name
        : b.subjects?.name,
      term_id: b.term_id,
      term_name: Array.isArray(b.terms) ? b.terms[0]?.name : b.terms?.name,
      teacher_name: Array.isArray(b.profiles)
        ? b.profiles[0]?.full_name
        : b.profiles?.full_name,
      status: b.status,
      created_at: b.created_at,
      confirmed_at: b.confirmed_at,
    }));

    return NextResponse.json({ success: true, data: { batches: list } });
  } catch (error: any) {
    console.error("GET /api/admin/score-sheets/batches error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requirePaidAdmin();
    if (!guard.authorized) return guard.response;
    const { schoolId, userId } = guard;

    const supabase = await createServerSupabase();
    const { class_id, subject_id, term_id } = await request.json();

    if (!class_id || !subject_id || !term_id) {
      return NextResponse.json(
        { error: "class_id, subject_id, term_id are required" },
        { status: 400 }
      );
    }

    // Verify class belongs to this school and is not deleted
    const { data: cls } = (await supabase
      .from("classes")
      .select("id, name")
      .eq("id", class_id)
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .maybeSingle()) as unknown as { data: any | null };

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Verify subject belongs to this school
    const { data: subject } = (await supabase
      .from("subjects")
      .select("id, name")
      .eq("id", subject_id)
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .maybeSingle()) as unknown as { data: any | null };

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Verify term belongs to this school
    const { data: term } = (await supabase
      .from("terms")
      .select("id, name")
      .eq("id", term_id)
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .maybeSingle()) as unknown as { data: any | null };

    if (!term) {
      return NextResponse.json({ error: "Term not found" }, { status: 404 });
    }

    // Reject if a live batch already exists for this triple
    const { data: existing } = (await supabase
      .from("score_sheet_batches")
      .select("id, status")
      .eq("school_id", schoolId)
      .eq("class_id", class_id)
      .eq("subject_id", subject_id)
      .eq("term_id", term_id)
      .neq("status", "discarded")
      .maybeSingle()) as unknown as { data: any | null };

    if (existing) {
      return NextResponse.json(
        {
          error: "A score sheet already exists for this class, subject, and term.",
          code: "DUPLICATE_BATCH",
          existing_batch_id: existing.id,
        },
        { status: 409 }
      );
    }

    // Resolve the subject teacher (for pre-filling the print sheet)
    const { data: cs } = (await supabase
      .from("class_subjects")
      .select("teacher_id")
      .eq("class_id", class_id)
      .eq("subject_id", subject_id)
      .maybeSingle()) as unknown as { data: any | null };

    const { data: created, error } = (await (supabase as any)
      .from("score_sheet_batches")
      .insert({
        school_id: schoolId,
        class_id,
        subject_id,
        term_id,
        teacher_id: cs?.teacher_id || null,
        status: "created",
        created_by: userId,
      })
      .select("id")
      .single()) as unknown as { data: any; error: unknown };

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { batch_id: created.id },
    });
  } catch (error: any) {
    console.error("POST /api/admin/score-sheets/batches error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
