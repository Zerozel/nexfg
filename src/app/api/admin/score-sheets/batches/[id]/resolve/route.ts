import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";

/**
 * PATCH /api/admin/score-sheets/batches/[id]/resolve
 * body: { rows: [{ student_id, ca1, ca2, ca3, exam }] }
 *
 * For each row: upsert up to 4 `scores` rows (one per assessment).
 * Skips cells that are null — the existing score is not touched.
 *
 * Rejects:
 *   - Batch already confirmed (409)
 *   - Batch discarded (409)
 *   - Rows referencing students not enrolled in the batch's class/term
 *   - Scores that exceed the configured max_score for their assessment
 */
export const runtime = "nodejs";

function coerceScore(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

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

    // ── Load batch + status ──
    const { data: batch } = (await supabase
      .from("score_sheet_batches")
      .select("id, class_id, subject_id, term_id, school_id, status")
      .eq("id", id)
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as {
      data: {
        id: string;
        class_id: string;
        subject_id: string;
        term_id: string;
        school_id: string;
        status: string;
      } | null;
    };

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch.status === "confirmed") {
      return NextResponse.json(
        {
          error: "This batch has already been confirmed.",
          code: "BATCH_CONFIRMED",
        },
        { status: 409 }
      );
    }

    if (batch.status === "discarded") {
      return NextResponse.json(
        {
          error: "This batch has been discarded and cannot be resolved.",
          code: "BATCH_DISCARDED",
        },
        { status: 409 }
      );
    }

    // ── Parse + validate rows ──
    const body = await request.json();
    const rows = body?.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "rows must be a non-empty array" },
        { status: 400 }
      );
    }

    // ── Load assessments for this class+subject+term ──
    const { data: assessments } = (await supabase
      .from("assessments")
      .select("id, name, max_score")
      .eq("class_id", batch.class_id)
      .eq("subject_id", batch.subject_id)
      .eq("term_id", batch.term_id)
      .eq("is_deleted", false)) as unknown as {
      data: { id: string; name: string; max_score: number }[] | null;
    };

    const assessmentByName = new Map<string, { id: string; max: number }>();
    for (const a of assessments || []) {
      assessmentByName.set(a.name.toUpperCase().trim(), {
        id: a.id,
        max: a.max_score,
      });
    }

    const ca1 = assessmentByName.get("CA1");
    const ca2 = assessmentByName.get("CA2");
    const ca3 = assessmentByName.get("CA3");
    const exam = assessmentByName.get("EXAM");

    // ── Load roster student IDs (for validation) ──
    const { data: enrollments } = (await supabase
      .from("enrollments")
      .select("student_id")
      .eq("class_id", batch.class_id)
      .eq("term_id", batch.term_id)
      .eq("is_current", true)
      .eq("is_deleted", false)) as unknown as {
      data: { student_id: string }[] | null;
    };

    const rosterIds = new Set(
      (enrollments || []).map((e) => e.student_id)
    );

    // ── Build upserts + audit updates ──
    const upserts: {
      school_id: string;
      student_id: string;
      assessment_id: string;
      score: number;
    }[] = [];

    const auditUpdates: {
      batch_id: string;
      student_id: string;
      resolved_ca1: number | null;
      resolved_ca2: number | null;
      resolved_ca3: number | null;
      resolved_exam: number | null;
      updated_at: string;
    }[] = [];

    const skipped: { student_id: string; reason: string }[] = [];
    const now = new Date().toISOString();

    for (const row of rows) {
      const studentId = row?.student_id;
      if (!studentId || typeof studentId !== "string") continue;

      if (!rosterIds.has(studentId)) {
        skipped.push({
          student_id: studentId,
          reason: "not enrolled in this class/term",
        });
        continue;
      }

      const ca1Val = coerceScore(row.ca1);
      const ca2Val = coerceScore(row.ca2);
      const ca3Val = coerceScore(row.ca3);
      const examVal = coerceScore(row.exam);

      const push = (
        assessment: { id: string; max: number } | undefined,
        value: number | null,
        label: string
      ) => {
        if (!assessment || value === null) return;
        if (value < 0 || value > assessment.max) {
          skipped.push({
            student_id: studentId,
            reason: `${label} out of range (0–${assessment.max}, got ${value})`,
          });
          return;
        }
        upserts.push({
          school_id: schoolId,
          student_id: studentId,
          assessment_id: assessment.id,
          score: value,
        });
      };

      push(ca1, ca1Val, "CA1");
      push(ca2, ca2Val, "CA2");
      push(ca3, ca3Val, "CA3");
      push(exam, examVal, "EXAM");

      auditUpdates.push({
        batch_id: id,
        student_id: studentId,
        resolved_ca1: ca1Val,
        resolved_ca2: ca2Val,
        resolved_ca3: ca3Val,
        resolved_exam: examVal,
        updated_at: now,
      });
    }

    if (upserts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          written: 0,
          skipped,
          message: "No scores to write (all blank or invalid)",
        },
      });
    }

    // ── Upsert scores ──
    const { error: upsertError } = await (supabase as any)
      .from("scores")
      .upsert(upserts, {
        onConflict: "school_id,student_id,assessment_id",
      });

    if (upsertError) throw upsertError;

    // ── Batch update extractions (per student_id, batched) ──
    // Supabase's upsert can't target a composite (batch_id, student_id) key
    // unless it's a unique constraint — which it isn't. Fall back to a
    // parallel-ish update via Promise.all in chunks.
    await Promise.all(
      auditUpdates.map((u) =>
        (supabase as any)
          .from("score_sheet_extractions")
          .update({
            resolved_ca1: u.resolved_ca1,
            resolved_ca2: u.resolved_ca2,
            resolved_ca3: u.resolved_ca3,
            resolved_exam: u.resolved_exam,
            updated_at: u.updated_at,
          })
          .eq("batch_id", u.batch_id)
          .eq("student_id", u.student_id)
      )
    );

    // ── Confirm batch ──
    await (supabase as any)
      .from("score_sheet_batches")
      .update({
        status: "confirmed",
        confirmed_at: now,
        updated_at: now,
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      data: {
        written: upserts.length,
        audit_updated: auditUpdates.length,
        skipped,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/score-sheets/resolve error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
