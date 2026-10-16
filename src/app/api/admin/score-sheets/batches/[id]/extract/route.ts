import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";
import { visionProvider } from "@/lib/ai";
/**
 * POST /api/admin/score-sheets/batches/[id]/extract
 * body: multipart/form-data with field "file"
 *
 * Steps:
 *   1. Verify batch is in a re-extractable state (not confirmed)
 *   2. Upload image to Supabase Storage (`score-sheets` bucket)
 *   3. Fetch batch metadata + expected student roster (excluding
 *      soft-deleted / inactive students)
 *   4. Call vision provider to extract scores
 *   5. Match extracted names to roster students
 *   6. Save extractions (raw_* columns)
 *   7. Update batch status to 'uploaded'
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requirePaidAdmin();
    if (!guard.authorized) return guard.response;
    const { schoolId } = guard;

    const { id } = await params;
    const supabase = await createServerSupabase();

    // ── Load batch ──
    const { data: batch, error: batchError } = (await supabase
      .from("score_sheet_batches")
      .select(
        `
        id,
        class_id,
        subject_id,
        term_id,
        school_id,
        status,
        classes:class_id(name),
        subjects:subject_id(name),
        terms:term_id(name, academic_years:academic_year_id(name)),
        schools:school_id(name)
      `
      )
      .eq("id", id)
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as { data: any | null; error: unknown };

    if (batchError) throw batchError;
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Confirmed batches cannot be re-extracted — scores are already saved
    // and re-extraction would desync the audit trail.
    if (batch.status === "confirmed") {
      return NextResponse.json(
        {
          error:
            "This batch is already confirmed. Create a new score sheet to re-enter scores.",
          code: "BATCH_CONFIRMED",
        },
        { status: 409 }
      );
    }

    // ── Load roster (excludes deleted/inactive students) ──
    const { data: enrollments } = (await supabase
      .from("enrollments")
      .select(
        "student_id, students:student_id!inner(id, full_name, admission_number, is_deleted, is_active)"
      )
      .eq("class_id", batch.class_id)
      .eq("term_id", batch.term_id)
      .eq("is_current", true)
      .eq("is_deleted", false)
      .eq("students.is_deleted", false)
      .eq("students.is_active", true)) as unknown as {
      data: any[] | null;
    };

    const roster = (enrollments || [])
      .map((e) => {
        const s = Array.isArray(e.students) ? e.students[0] : e.students;
        return s ? { id: s.id, name: s.full_name } : null;
      })
      .filter(Boolean) as { id: string; name: string }[];

    // ── Read + validate the file ──
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const rawExt = (file.type.split("/")[1] || "jpg").toLowerCase();
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : "jpg";
    const arrayBuffer = await file.arrayBuffer();
    const storagePath = `${schoolId}/${id}/source.${ext}`;

        // Storage operations bypass RLS via the service-role client. Authorization
    // is already enforced by requirePaidAdmin() above, and the storage path is
    // scoped to the caller's schoolId, so cross-tenant writes are impossible.
    const adminStorage = createAdminClient();

    const { error: uploadError } = await adminStorage.storage
      .from("score-sheets")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: signed } = await adminStorage.storage
      .from("score-sheets")
      .createSignedUrl(storagePath, 60 * 10);

    if (!signed?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to create signed URL" },
        { status: 500 }
      );
    }

    // ── Load assessment max scores ──
    const { data: assessments } = (await supabase
      .from("assessments")
      .select("name, max_score")
      .eq("class_id", batch.class_id)
      .eq("subject_id", batch.subject_id)
      .eq("term_id", batch.term_id)
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

    const schoolName = Array.isArray(batch.schools)
      ? batch.schools[0]?.name || "School"
      : batch.schools?.name || "School";
    const className = Array.isArray(batch.classes)
      ? batch.classes[0]?.name || "Class"
      : batch.classes?.name || "Class";
    const subjectName = Array.isArray(batch.subjects)
      ? batch.subjects[0]?.name || "Subject"
      : batch.subjects?.name || "Subject";
    const termName = Array.isArray(batch.terms)
      ? batch.terms[0]?.name || "Term"
      : batch.terms?.name || "Term";

    // ── Call VLM ──
    const result = await visionProvider.extractScoreSheet(signed.signedUrl, {
      schoolName,
      className,
      subjectName,
      termName,
      maxScores,
      expectedStudentNames: roster.map((r) => r.name),
    });

    // ── Match names → students ──
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const rosterByNorm = new Map(roster.map((r) => [normalize(r.name), r]));

    // ── Replace prior extractions (re-extract is allowed pre-confirm) ──
    await (supabase as any)
      .from("score_sheet_extractions")
      .delete()
      .eq("batch_id", id);

    const rows = result.students.map((s) => {
      const norm = s.name_on_sheet ? normalize(s.name_on_sheet) : "";
      const matchedStudent = norm ? rosterByNorm.get(norm) : undefined;
      return {
        batch_id: id,
        student_id: matchedStudent?.id || null,
        row_index: s.row_index,
        name_on_sheet: s.name_on_sheet,
        raw_ca1: s.ca1,
        raw_ca2: s.ca2,
        raw_ca3: s.ca3,
        raw_exam: s.exam,
        matched: !!matchedStudent,
        is_extra: !matchedStudent && !!s.name_on_sheet,
      };
    });

    if (rows.length > 0) {
      const { error: insertError } = await (supabase as any)
        .from("score_sheet_extractions")
        .insert(rows);
      if (insertError) throw insertError;
    }

    // ── Update batch ──
    await (supabase as any)
      .from("score_sheet_batches")
      .update({
        status: "uploaded",
        source_image_url: storagePath,
        extracted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      data: {
        extracted_count: rows.length,
        matched_count: rows.filter((r) => r.matched).length,
        unmatched_count: rows.filter((r) => r.is_extra).length,
        has_ambiguities: result.has_ambiguities,
        notes: result.notes,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/score-sheets/extract error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
