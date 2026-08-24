import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchCompiledResultsByStudent } from "@/lib/printing/compiled-results";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = await createServerSupabase();

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
    const studentResult = await supabase.from("students").select("id, full_name, admission_number, avatar_url:profile_image_url, school_id").eq("id", studentId).maybeSingle();
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
      // A teacher may teach several subjects in a class, so class_subjects can
      // return multiple rows for (class, teacher); limit(1) keeps maybeSingle safe.
      const ctResult = await supabase.from("class_subjects").select("id").eq("class_id", classId).eq("teacher_id", user.id).limit(1).maybeSingle();
      const ocResult = await supabase.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).maybeSingle();
      if (!ctResult.data && !ocResult.data) {
        return NextResponse.json({ success: false, error: "Not assigned to this class" }, { status: 403 });
      }
    }

    // Fetch school, class, term, class size, and compiled results in parallel.
    // `compiled_results` is a per-(student,subject) table, so we aggregate it
    // into the per-student shape the template expects via the shared helper.
    const [schoolResult, classResult, termResult, enrollCountResult, compiledMap] =
      await Promise.all([
        supabase.from("schools").select("*").eq("id", student.school_id).maybeSingle(),
        supabase.from("classes").select("id, name, teacher_id").eq("id", classId).maybeSingle(),
        supabase
          .from("terms")
          .select("*, academic_years:academic_year_id(name)")
          .eq("id", termId)
          .maybeSingle(),
        supabase
          .from("enrollments")
          .select("student_id", { count: "exact", head: true })
          .eq("class_id", classId)
          .eq("term_id", termId)
          .eq("is_current", true),
        fetchCompiledResultsByStudent(supabase, { classId, termId }),
      ]);

    if (!schoolResult.data) return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    if (!classResult.data) return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    if (!termResult.data) return NextResponse.json({ success: false, error: "Term not found" }, { status: 404 });

    const school: any = schoolResult.data;
    const classInfo: any = classResult.data;
    const term: any = termResult.data;

    // academic_session lives on academic_years.name (terms has no such column).
    const academicSession = Array.isArray(term.academic_years)
      ? term.academic_years[0]?.name
      : term.academic_years?.name;

    const aggregate = compiledMap.get(studentId) || null;
    const totalStudents =
      (enrollCountResult as any).count || aggregate?.total_students || 0;
    const compiledResult: any = aggregate
      ? {
          subjects: aggregate.subjects,
          average: aggregate.average,
          position: aggregate.position,
          total_students: totalStudents,
          grade: aggregate.grade,
          remarks: aggregate.remarks,
          updated_at: aggregate.updated_at,
        }
      : { subjects: [], average: 0, position: 0, total_students: totalStudents };

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
          id: term.id, name: term.name, academic_session: academicSession || "",
          start_date: term.start_date, end_date: term.end_date,
        },
        compiled_results: compiledResult,
        // The real `enrollments` table has no attendance columns; attendance is
        // not tracked yet, so return null and let the template omit it.
        attendance: null,
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
