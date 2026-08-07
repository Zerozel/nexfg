import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const role = user.app_metadata?.role;
    const userSchoolId = user.app_metadata?.school_id;

    // For super admin, get school_id from query params
    const { searchParams } = new URL(request.url);
    const schoolId =
      role === "super_admin"
        ? searchParams.get("school_id")
        : userSchoolId;

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID is required" },
        { status: 400 }
      );
    }

    // Fetch classes based on user role
    let classesQuery = supabase
      .from("classes")
      .select(
        `
        id,
        name,
        teacher_id,
        students:students(count)
      `
      )
      .eq("school_id", schoolId)
      .order("name");

    // If teacher, only get assigned classes
    if (role === "teacher") {
      // Get teacher's assigned classes from class_teachers
      const { data: assignedClassIds } = await supabase
        .from("class_teachers")
        .select("class_id")
        .eq("teacher_id", user.id);

      // Also get classes where teacher_id matches
      const { data: ownedClasses } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", user.id)
        .eq("school_id", schoolId);

      const allowedIds = Array.from(
        new Set([
          ...(assignedClassIds?.map((c: { class_id: string }) => c.class_id) || []),
          ...(ownedClasses?.map((c: { id: string }) => c.id) || []),
        ])
      );

      if (allowedIds.length > 0) {
        classesQuery = classesQuery.in("id", allowedIds);
      } else {
        // Teacher has no classes assigned
        return NextResponse.json({
          success: true,
          data: {
            classes: [],
            terms: [],
          },
        });
      }
    }

    const { data: classes, error: classesError } = await classesQuery;

    if (classesError) {
      console.error("Error fetching classes:", classesError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch classes" },
        { status: 500 }
      );
    }

    // Fetch teacher names for classes
    const teacherIds = classes
      ?.map((c: { teacher_id: string | null }) => c.teacher_id)
      .filter((id: string | null): id is string => id !== null);

    let teacherMap: Record<string, string> = {};
    if (teacherIds.length > 0) {
      const { data: teachers } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", teacherIds);

      teacherMap =
        teachers?.reduce<Record<string, string>>(
          (acc: Record<string, string>, t: { id: string; full_name: string }) => ({
            ...acc,
            [t.id]: t.full_name,
          }),
          {}
        ) || {};
    }

    // Fetch terms
    const { data: terms, error: termsError } = await supabase
      .from("terms")
      .select(
        `
        id,
        name,
        academic_session,
        is_current
      `
      )
      .eq("school_id", schoolId)
      .order("start_date", { ascending: false });

    if (termsError) {
      console.error("Error fetching terms:", termsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch terms" },
        { status: 500 }
      );
    }

    const formattedClasses = classes?.map((c: { id: string; name: string; students: unknown; teacher_id: string | null }) => ({
      id: c.id,
      name: c.name,
      student_count:
        Array.isArray(c.students) ? c.students.length : Number(c.students) || 0,
      teacher_id: c.teacher_id,
      teacher_name: c.teacher_id ? teacherMap[c.teacher_id] || null : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        classes: formattedClasses || [],
        terms: terms || [],
      },
    });
  } catch (error) {
    console.error("Error in classes API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
