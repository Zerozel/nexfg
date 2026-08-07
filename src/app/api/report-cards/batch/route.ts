import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    const user = authData.user;

    const body = await request.json();
    const { student_ids, term_id, class_id } = body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return NextResponse.json({ success: false, error: "student_ids array is required" }, { status: 400 });
    }
    if (!term_id || !class_id) {
      return NextResponse.json({ success: false, error: "term_id and class_id are required" }, { status: 400 });
    }

    // Get class info
    const classResult = await supabase.from("classes").select("id, name, school_id, teacher_id").eq("id", class_id).maybeSingle();
    if (!classResult.data) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }
    const classInfo: any = classResult.data;

    // Check permissions
    const role = user.app_metadata?.role;
    const userSchoolId = user.app_metadata?.school_id;
    if (role !== "super_admin" && userSchoolId !== classInfo.school_id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    if (role === "teacher") {
      const ctResult = await supabase.from("class_teachers").select("id").eq("class_id", class_id).eq("teacher_id", user.id).maybeSingle();
      const ocResult = await supabase.from("classes").select("id").eq("id", class_id).eq("teacher_id", user.id).maybeSingle();
      if (!ctResult.data && !ocResult.data) {
        return NextResponse.json({ success: false, error: "Not assigned to this class" }, { status: 403 });
      }
    }

    // Fetch school and term
    const schoolResult = await supabase.from("schools").select("*").eq("id", classInfo.school_id).maybeSingle();
    if (!schoolResult.data) {
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    }
    const school: any = schoolResult.data;

    const termResult = await supabase.from("terms").select("*").eq("id", term_id).maybeSingle();
    if (!termResult.data) {
      return NextResponse.json({ success: false, error: "Term not found" }, { status: 404 });
    }
    const term: any = termResult.data;

    // Get teacher name
    let teacherName: string | null = null;
    if (classInfo.teacher_id) {
		const teacherResult: any = await supabase.from("profiles").select("full_name").eq("id", classInfo.teacher_id).maybeSingle();
		teacherName = teacherResult?.data?.full_name || null;
    }

    // Fetch enrollments
    const enrollmentsResult = await supabase
      .from("student_enrollments")
      .select("student_id, students:student_id(id, full_name, admission_number, avatar_url)")
      .eq("class_id", class_id)
      .eq("term_id", term_id)
      .in("student_id", student_ids)
      .eq("is_active", true);
    const enrollments: any[] = enrollmentsResult.data || [];

    // Fetch compiled results
    const resultsResult = await supabase
      .from("compiled_results")
      .select("*")
      .in("student_id", student_ids)
      .eq("term_id", term_id)
      .eq("class_id", class_id);
    const compiledResults: any[] = resultsResult.data || [];

    // Build results map
    const resultsMap: Record<string, any> = {};
    for (const r of compiledResults) {
      resultsMap[r.student_id] = r;
    }

    // Transform students
    const studentsData = enrollments.map((enrollment: any) => {
      const student = Array.isArray(enrollment.students) ? enrollment.students[0] : enrollment.students;
      const result = resultsMap[enrollment.student_id] || {};

      return {
        student: {
          id: student?.id || enrollment.student_id,
          full_name: student?.full_name || "Unknown Student",
          admission_number: student?.admission_number || null,
          avatar_url: student?.avatar_url || null,
        },
        subjects: result.subjects || [],
        overall: {
          average: result.average || 0,
          position: result.position || 0,
          total_students: result.total_students || enrollments.length,
          total_subjects: (result.subjects || []).length,
          grade: result.grade || null,
          remarks: result.remarks || null,
        },
        issued_date: result.updated_at
          ? new Date(result.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
    });

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
        class: {
          id: classInfo.id, name: classInfo.name,
          teacher_name: teacherName, teacher_id: classInfo.teacher_id,
        },
        term: {
          id: term.id, name: term.name, academic_session: term.academic_session,
          start_date: term.start_date, end_date: term.end_date,
        },
        students: studentsData,
      },
    });
  } catch (error) {
    console.error("Error in batch print API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
