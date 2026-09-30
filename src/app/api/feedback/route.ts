import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * POST /api/feedback — any authenticated user submits feedback.
 * GET  /api/feedback — super_admin only, lists all feedback.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    const schoolId = user.app_metadata?.school_id;
    const { category, subject, body } = await request.json();

    if (!subject || !body || !category) {
      return NextResponse.json(
        { error: "category, subject, and body are required" },
        { status: 400 }
      );
    }

    if (!["bug", "feature", "general"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const { data, error } = (await (supabase as any)
      .from("feedback_submissions")
      .insert({
        school_id: schoolId || null,
        submitted_by: user.id,
        submitter_role: role || "unknown",
        category,
        subject: String(subject).trim(),
        body: String(body).trim(),
      })
      .select("id, created_at")
      .single()) as unknown as { data: any; error: unknown };

    if (error) throw error;

    return NextResponse.json({ success: true, data: { feedback: data } });
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    if (role !== "super_admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = (supabase as any)
      .from("feedback_submissions")
      .select(
        `
        id,
        school_id,
        submitted_by,
        submitter_role,
        category,
        subject,
        body,
        status,
        admin_notes,
        created_at,
        updated_at,
        schools:school_id(name),
        profiles:submitted_by(full_name)
      `
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = (await query) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (error) throw error;

    const list = (data || []).map((f) => ({
      id: f.id,
      school_id: f.school_id,
      school_name: Array.isArray(f.schools)
        ? f.schools[0]?.name || null
        : f.schools?.name || null,
      submitted_by: f.submitted_by,
      submitter_name: Array.isArray(f.profiles)
        ? f.profiles[0]?.full_name || "Unknown"
        : f.profiles?.full_name || "Unknown",
      submitter_role: f.submitter_role,
      category: f.category,
      subject: f.subject,
      body: f.body,
      status: f.status,
      admin_notes: f.admin_notes,
      created_at: f.created_at,
      updated_at: f.updated_at,
    }));

    return NextResponse.json({ success: true, data: { feedback: list } });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/feedback — super_admin updates status / notes.
 * body: { id, status?, admin_notes? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.app_metadata?.role !== "super_admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id, status, admin_notes } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) patch.status = status;
    if (admin_notes !== undefined) patch.admin_notes = admin_notes;

    const { error } = await (supabase as any)
      .from("feedback_submissions")
      .update(patch)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/feedback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
