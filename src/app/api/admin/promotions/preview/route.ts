import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/supabase/school-admin-auth";
import { previewPromotions } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const body = await request.json();
    const fromTermId = body.from_term_id;
    if (!fromTermId) {
      return NextResponse.json(
        { error: "from_term_id is required" },
        { status: 400 }
      );
    }

    const preview = await previewPromotions(supabase, schoolId, {
      from_term_id: fromTermId,
    });

    return NextResponse.json({ success: true, data: preview });
  } catch (error: any) {
    console.error("POST /api/admin/promotions/preview error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
