import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requirePaidAdmin();
    if (!guard.authorized) return guard.response;
    const { schoolId } = guard;

    const { id } = await params;
    const supabase = await createServerSupabase();

    const { data: batch, error } = (await supabase
      .from("score_sheet_batches")
      .select(
        `
        id,
        class_id,
        subject_id,
        term_id,
        teacher_id,
        status,
        source_image_url,
        created_at,
        confirmed_at,
        classes:class_id(name),
        subjects:subject_id(name),
        terms:term_id(name, academic_years:academic_year_id(name)),
        profiles:teacher_id(full_name)
      `
      )
      .eq("id", id)
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as { data: any | null; error: unknown };

    if (error) throw error;
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const { data: extractions } = (await supabase
      .from("score_sheet_extractions")
      .select("*")
      .eq("batch_id", id)
      .order("row_index", { ascending: true })) as unknown as {
      data: any[] | null;
    };

    const term = Array.isArray(batch.terms) ? batch.terms[0] : batch.terms;
    const academicYear = term?.academic_years
      ? Array.isArray(term.academic_years)
        ? term.academic_years[0]
        : term.academic_years
      : null;

    return NextResponse.json({
      success: true,
      data: {
        batch: {
          id: batch.id,
          class_id: batch.class_id,
          class_name: Array.isArray(batch.classes)
            ? batch.classes[0]?.name
            : batch.classes?.name,
          subject_id: batch.subject_id,
          subject_name: Array.isArray(batch.subjects)
            ? batch.subjects[0]?.name
            : batch.subjects?.name,
          term_id: batch.term_id,
          term_name: term?.name,
          academic_session: academicYear?.name || null,
          teacher_name: Array.isArray(batch.profiles)
            ? batch.profiles[0]?.full_name
            : batch.profiles?.full_name,
          status: batch.status,
          source_image_url: batch.source_image_url,
          created_at: batch.created_at,
          confirmed_at: batch.confirmed_at,
        },
        extractions: extractions || [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/score-sheets/batches/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requirePaidAdmin();
    if (!guard.authorized) return guard.response;
    const { schoolId } = guard;

    const { id } = await params;
    const supabase = await createServerSupabase();

    // Load the batch first to check status
    const { data: batch } = (await supabase
      .from("score_sheet_batches")
      .select("id, status")
      .eq("id", id)
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as {
      data: { id: string; status: string } | null;
    };

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Cannot discard a confirmed batch — scores are already written.
    // Admin must delete the scores first (via score entry UI) if they
    // really want to undo.
    if (batch.status === "confirmed") {
      return NextResponse.json(
        {
          error:
            "Cannot discard a confirmed batch. Scores have already been saved.",
          code: "BATCH_CONFIRMED",
        },
        { status: 409 }
      );
    }

    // Already discarded — idempotent success
    if (batch.status === "discarded") {
      return NextResponse.json({ success: true, data: { already_discarded: true } });
    }

    const { error } = await (supabase as any)
      .from("score_sheet_batches")
      .update({ status: "discarded", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/score-sheets/batches/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
