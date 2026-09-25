import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/supabase/school-admin-auth";

/**
 * GET: fetch all arms that share a base_name for the caller's school.
 * PUT: sync the arm set — create missing arms, update existing, soft-delete
 *      extras. Uses the base name as the group key.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ baseName: string }> }
) {
  try {
    const { baseName } = await params;

    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const decoded = decodeURIComponent(baseName);

    const { data, error } = await supabase
      .from("classes")
      .select(
        "id, name, base_name, arms_count, display_order, academic_year_id, teacher_id, profiles!classes_teacher_id_fkey(full_name)"
      )
      .eq("school_id", schoolId)
      .eq("base_name", decoded)
      .is("is_deleted", false)
      .order("name", { ascending: true });

    if (error) throw error;

    const arms = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      base_name: c.base_name,
      arms_count: c.arms_count,
      display_order: c.display_order,
      academic_year_id: c.academic_year_id,
      teacher_id: c.teacher_id,
      teacher_name: c.profiles?.full_name || null,
    }));

    return NextResponse.json({ success: true, data: { arms } });
  } catch (error: any) {
    console.error("GET /api/admin/classes/group/[baseName] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ baseName: string }> }
) {
  try {
    const { baseName } = await params;

    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const decoded = decodeURIComponent(baseName);
    const body = await request.json();

    const {
      academic_year_id,
      arms_count,
      display_order,
      arms,
    } = body as {
      academic_year_id: string;
      arms_count: number;
      display_order?: number | null;
      arms: Array<{
        id?: string;
        name?: string;
        teacher_id: string | null;
      }>;
    };

    if (!academic_year_id || !Array.isArray(arms) || arms.length === 0) {
      return NextResponse.json(
        { error: "academic_year_id and arms[] are required" },
        { status: 400 }
      );
    }

    // 1. Verify academic_year_id belongs to this school
    const { data: ay, error: ayError } = await supabase
      .from("academic_years")
      .select("id")
      .eq("id", academic_year_id)
      .eq("school_id", schoolId)
      .is("is_deleted", false)
      .maybeSingle();

    if (ayError) throw ayError;
    if (!ay) {
      return NextResponse.json(
        { error: "Academic year does not belong to this school" },
        { status: 400 }
      );
    }

    // 2. Load all existing arms in this group for this school
    const { data: existing, error: existingError } = await supabase
      .from("classes")
      .select("id, name, teacher_id")
      .eq("school_id", schoolId)
      .eq("base_name", decoded)
      .is("is_deleted", false);

    if (existingError) throw existingError;

    const existingById = new Map<string, any>(
      (existing || []).map((e: any) => [e.id, e])
    );

    const armLetters = "ABCDEFGHIJ".split("");
    const totalArms = arms.length;
    const errors: string[] = [];
    const results: any[] = [];

    // 3. Process each desired arm
    for (let i = 0; i < arms.length; i++) {
      const desired = arms[i];
      const letter = armLetters[i];
      const armName = desired.name || `${decoded}${letter}`;

      if (desired.id && existingById.has(desired.id)) {
        // Update existing arm
        const { data: updated, error: updateError } = await supabase
          .from("classes")
          .update({
            name: armName,
            base_name: decoded,
            arms_count: totalArms,
            display_order: display_order ?? null,
            academic_year_id,
            teacher_id: desired.teacher_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", desired.id)
          .eq("school_id", schoolId)
          .select("id, name, teacher_id")
          .single();

        if (updateError) errors.push(`Update ${armName}: ${updateError.message}`);
        else results.push(updated);
      } else {
        // Create new arm
        const { data: created, error: createError } = await supabase
          .from("classes")
          .insert({
            school_id: schoolId,
            academic_year_id,
            name: armName,
            base_name: decoded,
            arms_count: totalArms,
            display_order: display_order ?? null,
            teacher_id: desired.teacher_id,
          })
          .select("id, name, teacher_id")
          .single();

        if (createError) errors.push(`Create ${armName}: ${createError.message}`);
        else results.push(created);
      }
    }

    // 4. Soft-delete any existing arms that weren't in the desired set
    const desiredIds = new Set(
      arms.map((a) => a.id).filter((id): id is string => Boolean(id))
    );
    const toRemove = (existing || []).filter(
      (e: any) => !desiredIds.has(e.id)
    );

    if (toRemove.length > 0) {
      const { error: removeError } = await supabase
        .from("classes")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .in(
          "id",
          toRemove.map((e: any) => e.id)
        );

      if (removeError) errors.push(`Remove extras: ${removeError.message}`);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join("; "), partial: true, data: { results } },
        { status: 207 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { arms: results },
    });
  } catch (error: any) {
    console.error("PUT /api/admin/classes/group/[baseName] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
