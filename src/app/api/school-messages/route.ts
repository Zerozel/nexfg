import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/school-messages
 *   - teacher: returns their own conversation (creating on first call)
 *   - admin/principal: lists all conversations in their school
 *   - super_admin: lists all conversations across all schools
 *
 * POST /api/school-messages
 *   - teacher: creates conversation (if needed) and inserts message
 *   - admin: replies to a specific teacher's conversation
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    const schoolId = user.app_metadata?.school_id;

    // ── Super admin: list every conversation across every school ──
    if (role === "super_admin") {
      const { data, error } = (await supabase
        .from("school_conversations")
        .select(
          `
          id,
          teacher_user_id,
          school_id,
          status,
          last_message_at,
          unread_for_admin,
          created_at,
          profiles:teacher_user_id(full_name),
          schools:school_id(name)
        `
        )
        .order("last_message_at", { ascending: false })) as unknown as {
        data: any[] | null;
        error: unknown;
      };

      if (error) throw error;

      const list = (data || []).map((c) => ({
        id: c.id,
        teacher_user_id: c.teacher_user_id,
        teacher_name: Array.isArray(c.profiles)
          ? c.profiles[0]?.full_name || "Unknown teacher"
          : c.profiles?.full_name || "Unknown teacher",
        school_id: c.school_id,
        school_name: Array.isArray(c.schools)
          ? c.schools[0]?.name || "Unknown school"
          : c.schools?.name || "Unknown school",
        status: c.status,
        last_message_at: c.last_message_at,
        unread_count: c.unread_for_admin || 0,
        created_at: c.created_at,
      }));

      return NextResponse.json({ success: true, data: { conversations: list } });
    }

    if (!schoolId) {
      return NextResponse.json({ error: "No school associated" }, { status: 403 });
    }

    // ── Teacher: their own thread ──
    if (role === "teacher") {
      const { data: existing } = (await supabase
        .from("school_conversations")
        .select("id, teacher_user_id, status, last_message_at, unread_for_teacher, created_at")
        .eq("teacher_user_id", user.id)
        .maybeSingle()) as unknown as { data: any | null };

      if (existing) {
        return NextResponse.json({
          success: true,
          data: { conversation: existing },
        });
      }

      const { data: created, error } = (await (supabase as any)
        .from("school_conversations")
        .insert({
          school_id: schoolId,
          teacher_user_id: user.id,
          status: "open",
        })
        .select("id, teacher_user_id, status, last_message_at, unread_for_teacher, created_at")
        .single()) as unknown as { data: any; error: unknown };

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: { conversation: created },
      });
    }

    // ── Admin/principal: list all conversations in their school ──
    if (!["admin", "principal"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data, error } = (await supabase
      .from("school_conversations")
      .select(
        `
        id,
        teacher_user_id,
        status,
        last_message_at,
        unread_for_admin,
        created_at,
        profiles:teacher_user_id(full_name)
      `
      )
      .eq("school_id", schoolId)
      .order("last_message_at", { ascending: false })) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (error) throw error;

    const list = (data || []).map((c) => ({
      id: c.id,
      teacher_user_id: c.teacher_user_id,
      teacher_name: Array.isArray(c.profiles)
        ? c.profiles[0]?.full_name || "Unknown teacher"
        : c.profiles?.full_name || "Unknown teacher",
      status: c.status,
      last_message_at: c.last_message_at,
      unread_count: c.unread_for_admin || 0,
      created_at: c.created_at,
    }));

    return NextResponse.json({ success: true, data: { conversations: list } });
  } catch (error: any) {
    console.error("GET /api/school-messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    const schoolId = user.app_metadata?.school_id;
    const { conversationId, body } = await request.json();

    if (!body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "body is required" }, { status: 400 });
    }

    let convoId = conversationId as string | undefined;

    // ── Teacher: find or create their conversation ──
    if (role === "teacher") {
      if (!convoId) {
        const { data: existing } = (await supabase
          .from("school_conversations")
          .select("id")
          .eq("teacher_user_id", user.id)
          .maybeSingle()) as unknown as { data: any | null };

        if (existing) {
          convoId = existing.id;
        } else {
          const { data: created, error: createError } = (await (supabase as any)
            .from("school_conversations")
            .insert({
              school_id: schoolId,
              teacher_user_id: user.id,
              status: "open",
            })
            .select("id")
            .single()) as unknown as { data: any; error: unknown };

          if (createError) throw createError;
          convoId = created.id;
        }
      }

      const { data: message, error: insertError } = (await (supabase as any)
        .from("school_messages")
        .insert({
          conversation_id: convoId,
          sender_id: user.id,
          sender_role: "teacher",
          body: body.trim(),
        })
        .select("id, conversation_id, sender_id, sender_role, body, read_at, created_at")
        .single()) as unknown as { data: any; error: unknown };

      if (insertError) throw insertError;

      const { data: current } = await (supabase as any)
        .from("school_conversations")
        .select("unread_for_admin")
        .eq("id", convoId)
        .maybeSingle();

      await (supabase as any)
        .from("school_conversations")
        .update({ unread_for_admin: (current?.unread_for_admin || 0) + 1 })
        .eq("id", convoId);

      return NextResponse.json({ success: true, data: { message } });
    }

    // ── Admin: reply to a specific conversation ──
    if (!["admin", "principal"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!convoId) {
      return NextResponse.json(
        { error: "conversationId is required for admins" },
        { status: 400 }
      );
    }

    const { data: convo } = (await supabase
      .from("school_conversations")
      .select("id, school_id")
      .eq("id", convoId)
      .maybeSingle()) as unknown as { data: any | null };

    if (!convo || convo.school_id !== schoolId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: message, error: insertError } = (await (supabase as any)
      .from("school_messages")
      .insert({
        conversation_id: convoId,
        sender_id: user.id,
        sender_role: "admin",
        body: body.trim(),
      })
      .select("id, conversation_id, sender_id, sender_role, body, read_at, created_at")
      .single()) as unknown as { data: any; error: unknown };

    if (insertError) throw insertError;

    const { data: current } = await (supabase as any)
      .from("school_conversations")
      .select("unread_for_teacher")
      .eq("id", convoId)
      .maybeSingle();

    await (supabase as any)
      .from("school_conversations")
      .update({ unread_for_teacher: (current?.unread_for_teacher || 0) + 1 })
      .eq("id", convoId);

    return NextResponse.json({ success: true, data: { message } });
  } catch (error: any) {
    console.error("POST /api/school-messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
