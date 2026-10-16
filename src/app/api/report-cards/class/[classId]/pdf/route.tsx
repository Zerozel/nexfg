import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchCompiledResultsByStudent } from "@/lib/printing/compiled-results";
import { transformStudentReportData } from "@/lib/printing/data-transform";
import { ReportCardBatchDocument } from "@/lib/pdf/ReportCardBatchDocument";
import type { IndividualReportCardData } from "@/types/printing";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/report-cards/class/[classId]/pdf?termId=X
 *
 * Renders all report cards for a class + term as a single multi-page PDF.
 *
 * Permissions:
 *   - super_admin: any class
 *   - admin/principal: their school's classes
 *   - teacher: only assigned/owned classes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const supabase = await createServerSupabase();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const user = authData.user;

    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("termId");
    if (!termId) {
      return NextResponse.json(
        { success: false, error: "termId is required" },
        { status: 400 }
      );
    }

    // ── Load class ──
    const classResult = await supabase
      .from("classes")
      .select("id, name, school_id, teacher_id")
      .eq("id", classId)
      .maybeSingle();

    if (!classResult.data) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }
    const classInfo: any = classResult.data;

    // ── Permissions ──
    const role = user.app_metadata?.role;
    const userSchoolId = user.app_metadata?.school_id;

    if (role !== "super_admin" && userSchoolId !== classInfo.school_id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    if (role === "teacher") {
      const ctResult = await supabase
        .from("class_subjects")
        .select("id")
        .eq("class_id", classId)
        .eq("teacher_id", user.id)
        .limit(1)
        .maybeSingle();
      const ocResult = await supabase
        .from("classes")
        .select("id")
        .eq("id", classId)
        .eq("teacher_id", user.id)
        .maybeSingle();
      if (!ctResult.data && !ocResult.data) {
        return NextResponse.json(
          { success: false, error: "Not assigned to this class" },
          { status: 403 }
        );
      }
    }

    // ── Load school ──
    const schoolResult = await supabase
      .from("schools")
      .select("*")
      .eq("id", classInfo.school_id)
      .maybeSingle();
    if (!schoolResult.data) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      );
    }
    const school: any = schoolResult.data;

    // ── Load term ──
    const termResult = await supabase
      .from("terms")
      .select("*, academic_years:academic_year_id(name)")
      .eq("id", termId)
      .maybeSingle();
    if (!termResult.data) {
      return NextResponse.json(
        { success: false, error: "Term not found" },
        { status: 404 }
      );
    }
    const term: any = termResult.data;
    const academicSession = Array.isArray(term.academic_years)
      ? term.academic_years[0]?.name
      : term.academic_years?.name;

    // ── Teacher name ──
    let teacherName: string | null = null;
    if (classInfo.teacher_id) {
      const teacherResult: any = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", classInfo.teacher_id)
        .maybeSingle();
      teacherName = teacherResult?.data?.full_name || null;
    }

    // ── Enrolled students ──
    const enrollmentsResult = await supabase
      .from("enrollments")
      .select(
        "student_id, students:student_id!inner(id, full_name, admission_number, avatar_url:profile_image_url, is_deleted, is_active)"
      )
      .eq("class_id", classId)
      .eq("term_id", termId)
      .eq("is_current", true)
      .eq("is_deleted", false)
      .eq("students.is_deleted", false)
      .eq("students.is_active", true);

    const enrollments: any[] = enrollmentsResult.data || [];

    const schoolPayload = {
      id: school.id,
      name: school.name,
      logo_url: school.logo_url,
      motto: school.motto,
      address: school.address,
      phone: school.phone,
      email: school.email,
      primary_color: school.primary_color || "#2563eb",
      principal_name: school.principal_name,
      principal_signature_url: school.principal_signature_url,
      grading_system: school.grading_system || null,
    };

    const classPayload = {
      id: classInfo.id,
      name: classInfo.name,
      teacher_name: teacherName,
      teacher_id: classInfo.teacher_id,
    };

    const termPayload = {
      id: term.id,
      name: term.name,
      academic_session: academicSession || "",
      start_date: term.start_date,
      end_date: term.end_date,
    };

    if (enrollments.length === 0) {
      return NextResponse.json(
        { success: false, error: "No enrolled students in this class" },
        { status: 404 }
      );
    }

    // ── Aggregate compiled results ──
    const studentIds = enrollments.map((e: any) => e.student_id);
    const resultsMap = await fetchCompiledResultsByStudent(supabase, {
      classId,
      termId,
      studentIds,
    });

    // ── Build IndividualReportCardData per student ──
    const reportData: IndividualReportCardData[] = enrollments
      .map((enrollment: any) => {
        const student = Array.isArray(enrollment.students)
          ? enrollment.students[0]
          : enrollment.students;
        const result = resultsMap.get(enrollment.student_id);

        const raw = {
          school: schoolPayload,
          student: {
            id: student?.id || enrollment.student_id,
            full_name: student?.full_name || "Unknown Student",
            admission_number: student?.admission_number || null,
            avatar_url: student?.avatar_url || null,
          },
          class: classPayload,
          term: termPayload,
          compiled_results: {
            subjects: result?.subjects || [],
            average: result?.average || 0,
            position: result?.position || 0,
            total_students: result?.total_students || enrollments.length,
            grade: result?.grade || null,
            remarks: result?.remarks || null,
            teacher_comment: null,
            principal_comment: null,
          },
          issued_date: new Date().toISOString().split("T")[0],
          has_compiled_results: !!result && (result.subjects?.length || 0) > 0,
          attendance: null,
          affective_traits: null,
          psychomotor_skills: null,
        };

        return transformStudentReportData(raw);
      })
      .sort((a, b) => a.overall.position - b.overall.position);

    // ── Render PDF ──
    const pdfBuffer = await renderToBuffer(
      <ReportCardBatchDocument
        school={schoolPayload}
        class={classPayload}
        term={termPayload}
        students={reportData}
      />
    );

    const pdfBytes = new Uint8Array(pdfBuffer);

    const safeClass = classPayload.name.replace(/[^a-zA-Z0-9]/g, "_");
    const safeTerm = termPayload.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `report-cards_${safeClass}_${safeTerm}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: any) {
    console.error("Report card PDF error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
