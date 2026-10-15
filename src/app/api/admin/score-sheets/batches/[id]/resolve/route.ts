import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";

/**
 * PATCH /api/admin/score-sheets/batches/[id]/resolve
 * body: { rows: [{ student_id, ca1, ca2, ca3, exam }] }
 *
 * For each row: upsert up to 4 `scores` rows (one per assessment).
 * Skips cells that are null — the existing score is not touched.
 */
export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requirePaidAdmin();
    if (!guard.authorized) return guard.response;
    const { schoolId } = guard;

    const { id } = await params;
    const supabase = await createServerSupabase();

    const { data: batch } = (await supabase
      .from("score_sheet_batches")
      .select("id, class_id, subject_id, term_id, school_id")
      .eq("id", id)
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as { data: any | null };

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const { rows } = await request.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "rows must be a non-empty array" },
        { status: 400 }
      );
    }

    const { data: assessments } = (await supabase
      .from("assessments")
      .select("id, name")
      .eq("class_id", batch.class_id)
      .eq("subject_id", batch.subject_id)
      .eq("term_id", batch.term_id)
      .eq("is_deleted", false)) as unknown as {
      data: { id: string; name: string }[] | null;
    };

    const assessmentIdByName = new Map<string, string>();
    for (const a of assessments || []) {
      assessmentIdByName.set(a.name.toUpperCase().trim(), a.id);
    }

    const ca1Id = assessmentIdByName.get("CA1");
    const ca2Id = assessmentIdByName.get("CA2");
    const ca3Id = assessmentIdByName.get("CA3");
    const examId = assessmentIdByName.get("EXAM");

    const upserts: any[] = [];

    for (const row of rows) {
      if (!row.student_id) continue;

      const push = (assessmentId: string | undefined, score: number | null) => {
        if (!assessmentId) return;
        if (score === null || score === undefined) return;
        upserts.push({
          school_id: schoolId,
          student_id: row.student_id,
          assessment_id: assessmentId,
          score,
        });
      };

      push(ca1Id, row.ca1);
      push(ca2Id, row.ca2);
      push(ca3Id, row.ca3);
      push(examId, row.exam);
    }

    if (upserts.length === 0) {
      return NextResponse.json({
        success: true,
        data: { written: 0, message: "No scores to write (all blank)" },
      });
    }

    const { error: upsertError } = await (supabase as any)
      .from("scores")
      .upsert(upserts, {
        onConflict: "school_id,student_id,assessment_id",
      });

    if (upsertError) throw upsertError;

    for (const row of rows) {
      if (!row.student_id) continue;
      await (supabase as any)
        .from("score_sheet_extractions")
        .update({
          resolved_ca1: row.ca1,
          resolved_ca2: row.ca2,
          resolved_ca3: row.ca3,
          resolved_exam: row.exam,
          updated_at: new Date().toISOString(),
        })
        .eq("batch_id", id)
        .eq("student_id", row.student_id);
    }

    await (supabase as any)
      .from("score_sheet_batches")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      data: { written: upserts.length },
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/score-sheets/resolve error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
