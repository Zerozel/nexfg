import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/support/conversations
 *   - admin/principal: returns their school's single conversation (creating
 *     one on first call if it doesn't exist)
 *   - super_admin: returns every conversation, ordered by last message,
 *     with school name and unread counts
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    const schoolId = user.app_metadata?.school_id;

    // ── Super admin: list all ──
    if (role === "super_admin") {
      const { data: convos, error } = (await supabase
        .from("support_conversations")
        .select(
          `
          id,
          school_id,
          admin_user_id,
          status,
          last_message_at,
          unread_for_support,
          created_at,
          schools:school_id(name)
        `
        )
        .order("last_message_at", { ascending: false })) as unknown as {
        data: any[] | null;
        error: unknown;
      };

      if (error) throw error;

      const list = (convos || []).map((c) => ({
        id: c.id,
        school_id: c.school_id,
        school_name: Array.isArray(c.schools)
          ? c.schools[0]?.name || "Unknown school"
          : c.schools?.name || "Unknown school",
        admin_user_id: c.admin_user_id,
        status: c.status,
        last_message_at: c.last_message_at,
        unread_count: c.unread_for_support || 0,
        created_at: c.created_at,
      }));

      return NextResponse.json({ success: true, data: { conversations: list } });
    }

    // ── School admin: get or create their conversation ──
    if (!["admin", "principal"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated" },
        { status: 403 }
      );
    }

    const { data: existing } = (await supabase
      .from("support_conversations")
      .select(
        "id, school_id, admin_user_id, status, last_message_at, unread_for_school, created_at"
      )
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as { data: any | null };

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { conversation: existing },
      });
    }

    // Create one. Cast `supabase` as any because the generated Supabase types
    // are still a placeholder — the insert payload infers as `never[]` without
    // them.
    const { data: created, error: createError } = (await (supabase as any)
      .from("support_conversations")
      .insert({
        school_id: schoolId,
        admin_user_id: user.id,
        status: "open",
      })
      .select(
        "id, school_id, admin_user_id, status, last_message_at, unread_for_school, created_at"
      )
      .single()) as unknown as { data: any; error: unknown };

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      data: { conversation: created },
    });
  } catch (error: any) {
    console.error("GET /api/support/conversations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
