import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const studentId = params.id;

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    const user = authData.user;

    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("termId");
    const classId = searchParams.get("classId");
    if (!termId || !classId) {
      return NextResponse.json({ success: false, error: "termId and classId are required" }, { status: 400 });
    }

    // Fetch student
    const studentResult = await supabase.from("students").select("id, full_name, admission_number, avatar_url, school_id").eq("id", studentId).maybeSingle();
    if (!studentResult.data) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }
    const student: any = studentResult.data;

    // Check permissions
    const role = user.app_metadata?.role;
    const userSchoolId = user.app_metadata?.school_id;
    if (role !== "super_admin" && userSchoolId !== student.school_id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    if (role === "teacher") {
      const ctResult = await supabase.from("class_teachers").select("id").eq("class_id", classId).eq("teacher_id", user.id).maybeSingle();
      const ocResult = await supabase.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).maybeSingle();
      if (!ctResult.data && !ocResult.data) {
        return NextResponse.json({ success: false, error: "Not assigned to this class" }, { status: 403 });
      }
    }

    // Fetch school, class, term in parallel
    const [schoolResult, classResult, termResult, resultData, enrollmentResult] = await Promise.all([
      supabase.from("schools").select("*").eq("id", student.school_id).maybeSingle(),
      supabase.from("classes").select("id, name, teacher_id").eq("id", classId).maybeSingle(),
      supabase.from("terms").select("*").eq("id", termId).maybeSingle(),
      supabase.from("compiled_results").select("*").eq("student_id", studentId).eq("term_id", termId).eq("class_id", classId).maybeSingle(),
      supabase.from("student_enrollments").select("attendance_total, attendance_present").eq("student_id", studentId).eq("class_id", classId).eq("term_id", termId).maybeSingle(),
    ]);

    if (!schoolResult.data) return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    if (!classResult.data) return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    if (!termResult.data) return NextResponse.json({ success: false, error: "Term not found" }, { status: 404 });

    const school: any = schoolResult.data;
    const classInfo: any = classResult.data;
    const term: any = termResult.data;
    const compiledResult: any = resultData.data;
    const enrollment: any = enrollmentResult.data;

    // Get teacher name
    let teacherName: string | null = null;
    if (classInfo.teacher_id) {
		const teacherResult: any = await supabase.from("profiles").select("full_name").eq("id", classInfo.teacher_id).maybeSingle();
		teacherName = teacherResult?.data?.full_name || null;
	}

    return NextResponse.json({
      success: true,
      data: {
        school: {
          id: school.id, name: school.name, logo_url: school.logo_url, motto: school.motto,
          address: school.address, phone: school.phone, email: school.email,
          primary_color: school.primary_color || "#2563eb",
          principal_name: school.principal_name,
          principal_signature_url: school.principal_signature_url,
        },
        student: {
          id: student.id, full_name: student.full_name,
          admission_number: student.admission_number, avatar_url: student.avatar_url,
        },
        class: {
          id: classInfo.id, name: classInfo.name,
          teacher_name: teacherName, teacher_id: classInfo.teacher_id,
        },
        term: {
          id: term.id, name: term.name, academic_session: term.academic_session,
          start_date: term.start_date, end_date: term.end_date,
        },
        compiled_results: compiledResult || { subjects: [], average: 0, position: 0, total_students: 0 },
        attendance: enrollment ? {
          total_days: enrollment.attendance_total || 0,
          present: enrollment.attendance_present || 0,
          absent: (enrollment.attendance_total || 0) - (enrollment.attendance_present || 0),
        } : null,
        affective_traits: [],
        psychomotor_skills: [],
        issued_date: compiledResult?.updated_at
          ? new Date(compiledResult.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error in student report card API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
