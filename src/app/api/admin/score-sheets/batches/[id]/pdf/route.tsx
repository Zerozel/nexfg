import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServerSupabase } from "@/lib/supabase/server";
import { requirePaidAdmin } from "@/lib/score-sheets/subscription-guard";
import {
  ScoreSheetDocument,
  type ScoreSheetData,
} from "@/lib/pdf/ScoreSheetDocument";

/**
 * GET /api/admin/score-sheets/batches/[id]/pdf
 *
 * Generates the printable score sheet for a batch as a PDF.
 * Idempotent and deterministic — same input always produces the same PDF.
 *
 * Student roster excludes soft-deleted / inactive students.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

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

    // ── Load batch context ──
    const { data: batch, error: batchError } = (await supabase
      .from("score_sheet_batches")
      .select(
        `
        id,
        class_id,
        subject_id,
        term_id,
        teacher_id,
        classes:class_id(name),
        subjects:subject_id(name),
        terms:term_id(name, academic_years:academic_year_id(name)),
        schools:school_id(name, logo_url),
        profiles:teacher_id(full_name)
      `
      )
      .eq("id", id)
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as { data: any | null; error: unknown };

    if (batchError) throw batchError;
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const school = Array.isArray(batch.schools)
      ? batch.schools[0]
      : batch.schools;
    const cls = Array.isArray(batch.classes) ? batch.classes[0] : batch.classes;
    const subject = Array.isArray(batch.subjects)
      ? batch.subjects[0]
      : batch.subjects;
    const term = Array.isArray(batch.terms) ? batch.terms[0] : batch.terms;
    const teacher = Array.isArray(batch.profiles)
      ? batch.profiles[0]
      : batch.profiles;

    const academicSession = term?.academic_years
      ? Array.isArray(term.academic_years)
        ? term.academic_years[0]?.name || ""
        : term.academic_years?.name || ""
      : "";

    // ── Load enrolled students (excludes deleted/inactive) ──
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

    const docData: ScoreSheetData = {
      schoolName: school?.name || "School",
      logoUrl: school?.logo_url || null,
      className: cls?.name || "Class",
      subjectName: subject?.name || "Subject",
      termName: term?.name || "Term",
      academicSession,
      teacherName: teacher?.full_name || null,
      students: students as ScoreSheetData["students"],
      maxScores,
      generatedAt: new Date().toISOString(),
      extraBlankRows: 3,
    };

    // ── Render PDF ──
    const pdfBuffer = await renderToBuffer(
      <ScoreSheetDocument data={docData} />
    );

    const pdfBytes = new Uint8Array(pdfBuffer);

    const safeClass = docData.className.replace(/[^a-zA-Z0-9]/g, "_");
    const safeSubject = docData.subjectName.replace(/[^a-zA-Z0-9]/g, "_");
    const safeTerm = docData.termName.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `score-sheet_${safeClass}_${safeSubject}_${safeTerm}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/score-sheets/batches/[id]/pdf error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
