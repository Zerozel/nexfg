import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";
import { visionProvider } from "@/lib/ai";

/**
 * POST /api/admin/score-sheets/batches/[id]/extract
 * body: multipart/form-data with field "file"
 *
 * Steps:
 *   1. Upload image to Supabase Storage (`score-sheets` bucket)
 *   2. Fetch batch metadata + expected student roster
 *   3. Call vision provider to extract scores
 *   4. Match extracted names to roster students
 *   5. Save extractions (raw_* columns)
 *   6. Update batch status to 'uploaded'
 */
export const runtime = "nodejs";
export const maxDuration = 60;

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

    const { data: batch, error: batchError } = (await supabase
      .from("score_sheet_batches")
      .select(
        `
        id,
        class_id,
        subject_id,
        term_id,
        school_id,
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

    const { data: enrollments } = (await supabase
      .from("enrollments")
      .select(
        "student_id, students:student_id(id, full_name, admission_number)"
      )
      .eq("class_id", batch.class_id)
      .eq("term_id", batch.term_id)
      .eq("is_current", true)) as unknown as { data: any[] | null };

    const roster = (enrollments || [])
      .map((e) => {
        const s = Array.isArray(e.students) ? e.students[0] : e.students;
        return s ? { id: s.id, name: s.full_name } : null;
      })
      .filter(Boolean) as { id: string; name: string }[];

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const ext = (file.type.split("/")[1] || "jpg").toLowerCase();
    const storagePath = `${schoolId}/${id}/source.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("score-sheets")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: signed } = await supabase.storage
      .from("score-sheets")
      .createSignedUrl(storagePath, 60 * 10);

    if (!signed?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to create signed URL" },
        { status: 500 }
      );
    }

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

    const result = await visionProvider.extractScoreSheet(signed.signedUrl, {
      schoolName,
      className,
      subjectName,
      termName,
      maxScores,
      expectedStudentNames: roster.map((r) => r.name),
    });

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const rosterByNorm = new Map(roster.map((r) => [normalize(r.name), r]));

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
