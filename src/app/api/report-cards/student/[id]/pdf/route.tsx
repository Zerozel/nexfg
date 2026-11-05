import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchCompiledResultsByStudent } from "@/lib/printing/compiled-results";
import { transformStudentReportData } from "@/lib/printing/data-transform";
import { getReportCardComponent } from "@/lib/pdf";
import type { IndividualReportCardData } from "@/types/printing";
import { Document } from "@react-pdf/renderer";
import React from "react";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
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
    const classId = searchParams.get("classId");
    if (!termId || !classId) {
      return NextResponse.json(
        { success: false, error: "termId and classId are required" },
        { status: 400 }
      );
    }

    const studentResult = await supabase
      .from("students")
      .select("id, full_name, admission_number, avatar_url:profile_image_url, school_id")
      .eq("id", studentId)
      .maybeSingle();

    if (!studentResult.data) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }
    const student: any = studentResult.data;

    const role = user.app_metadata?.role;
    const userSchoolId = user.app_metadata?.school_id;
    if (role !== "super_admin" && userSchoolId !== student.school_id) {
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

    const [schoolResult, classResult, termResult, compiledMap, affectiveRes, psychomotorRes] =
      await Promise.all([
        supabase
          .from("schools")
          .select("*")
          .eq("id", student.school_id)
          .maybeSingle(),
        supabase
          .from("classes")
          .select("id, name, teacher_id")
          .eq("id", classId)
          .maybeSingle(),
        supabase
          .from("terms")
          .select("*, academic_years:academic_year_id(name)")
          .eq("id", termId)
          .maybeSingle(),
        fetchCompiledResultsByStudent(supabase, {
          classId,
          termId,
          studentIds: [studentId],
        }),
        supabase
          .from("student_affective_traits")
          .select("*")
          .eq("student_id", studentId)
          .eq("term_id", termId),
        supabase
          .from("student_psychomotor_skills")
          .select("*")
          .eq("student_id", studentId)
          .eq("term_id", termId),
      ]);

    if (!schoolResult.data) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      );
    }
    if (!classResult.data) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }
    if (!termResult.data) {
      return NextResponse.json(
        { success: false, error: "Term not found" },
        { status: 404 }
      );
    }

    const school: any = schoolResult.data;
    const classInfo: any = classResult.data;
    const term: any = termResult.data;

    const academicSession = Array.isArray(term.academic_years)
      ? term.academic_years[0]?.name
      : term.academic_years?.name;

    let teacherName: string | null = null;
    if (classInfo.teacher_id) {
      const teacherResult: any = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", classInfo.teacher_id)
        .maybeSingle();
      teacherName = teacherResult?.data?.full_name || null;
    }

    const result = compiledMap.get(studentId);
    const subjects = result?.subjects || [];

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
      ca_count: (school.ca_count as number | null) ?? 2,
      report_card_template: school.report_card_template || "classic_nigerian",
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

    const raw = {
      school: schoolPayload,
      student: {
        id: student.id,
        full_name: student.full_name,
        admission_number: student.admission_number,
        avatar_url: student.avatar_url,
      },
      class: classPayload,
      term: termPayload,
      compiled_results: {
        subjects,
        average: result?.average || 0,
        position: result?.position || 0,
        total_students: result?.total_students || 0,
        grade: result?.grade || null,
        remarks: result?.remarks || null,
        teacher_comment: null,
        principal_comment: null,
      },
      issued_date: result?.updated_at
        ? new Date(result.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      has_compiled_results: subjects.length > 0,
      attendance: null,
      affective_traits: affectiveRes.data || null,
      psychomotor_skills: psychomotorRes.data || null,
    };

    const reportData: IndividualReportCardData =
      transformStudentReportData(raw);

    const templateName = schoolPayload.report_card_template;
    const TemplateComponent = getReportCardComponent(templateName, reportData);
    const pageElement = (TemplateComponent.props as any).children;

    const pdfBuffer = await renderToBuffer(
      <Document>{pageElement}</Document>
    );

    const pdfBytes = new Uint8Array(pdfBuffer);

    const safeName = (student.full_name || "student")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .slice(0, 40);
    const safeTerm = termPayload.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `report-card_${safeName}_${safeTerm}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: any) {
    console.error("GET /api/report-cards/student/[id]/pdf error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
