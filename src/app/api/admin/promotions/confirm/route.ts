import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/supabase/school-admin-auth";
import { confirmPromotions } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId, user } = guard;

    const body = await request.json();
    const { from_term_id, students } = body;

    if (!from_term_id || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "from_term_id and students[] are required" },
        { status: 400 }
      );
    }

    const result = await confirmPromotions(supabase, schoolId, user.id, {
      from_term_id,
      students,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POST /api/admin/promotions/confirm error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
