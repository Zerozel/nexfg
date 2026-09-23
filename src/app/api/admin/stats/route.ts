import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

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
    const schoolId = user.app_metadata?.school_id;

    if (!["admin", "principal", "super_admin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "No school associated with this user" },
        { status: 403 }
      );
    }

    const [studentsResult, teachersResult, classesResult] = await Promise.all([
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("is_deleted", false),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("is_deleted", false)
        .in("role", ["teacher", "admin", "principal"]),
      supabase
        .from("classes")
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("is_deleted", false),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        students: studentsResult.count || 0,
        teachers: teachersResult.count || 0,
        classes: classesResult.count || 0,
      },
    });
  } catch (error) {
    console.error("Error in admin stats API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
