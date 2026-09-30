import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/support/messages?conversationId=X
 *   - Returns all messages in the conversation.
 *   - Marks the counterpart's unread counter to 0 for the reading side.
 *
 * POST /api/support/messages
 *   body: { conversationId, body }
 *   - Inserts a message and bumps the counterpart's unread counter.
 */
export async function GET(request: NextRequest) {
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
    const conversationId = new URL(request.url).searchParams.get(
      "conversationId"
    );

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Verify access via the conversation row
    const { data: convo, error: convoError } = (await supabase
      .from("support_conversations")
      .select("id, school_id, admin_user_id, unread_for_school, unread_for_support")
      .eq("id", conversationId)
      .maybeSingle()) as unknown as { data: any | null; error: unknown };

    if (convoError) throw convoError;
    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isSuperAdmin = role === "super_admin";
    const isSchoolSide = convo.school_id === schoolId;

    if (!isSuperAdmin && !isSchoolSide) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error } = (await supabase
      .from("support_messages")
      .select(
        "id, conversation_id, sender_id, sender_role, body, read_at, created_at"
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (error) throw error;

    // Reset the caller's unread counter
    const update = isSuperAdmin
      ? { unread_for_support: 0 }
      : { unread_for_school: 0 };
    await (supabase as any)
      .from("support_conversations")
      .update(update)
      .eq("id", conversationId);

    // Mark the counterpart's messages as read
    const counterpartRole = isSuperAdmin ? "school" : "support";
    await (supabase as any)
      .from("support_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("sender_role", counterpartRole)
      .is("read_at", null);

    return NextResponse.json({
      success: true,
      data: { messages: messages || [] },
    });
  } catch (error: any) {
    console.error("GET /api/support/messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { conversationId, body } = await request.json();
    if (!conversationId || !body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json(
        { error: "conversationId and non-empty body are required" },
        { status: 400 }
      );
    }

    // Verify access
    const { data: convo, error: convoError } = (await supabase
      .from("support_conversations")
      .select("id, school_id")
      .eq("id", conversationId)
      .maybeSingle()) as unknown as { data: any | null; error: unknown };

    if (convoError) throw convoError;
    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isSuperAdmin = role === "super_admin";
    const isSchoolSide = convo.school_id === schoolId;

    if (!isSuperAdmin && !isSchoolSide) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const senderRole = isSuperAdmin ? "support" : "school";

    // Cast `supabase` as any because the generated Supabase types are still a
    // placeholder — the insert payload infers as `never[]` without them.
    const { data: message, error: insertError } = (await (supabase as any)
      .from("support_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_role: senderRole,
        body: body.trim(),
      })
      .select(
        "id, conversation_id, sender_id, sender_role, body, read_at, created_at"
      )
      .single()) as unknown as { data: any; error: unknown };

    if (insertError) throw insertError;

    // Bump the counterpart's unread counter
    const bump = isSuperAdmin
      ? {
          unread_for_school:
            (await getUnread(supabase, conversationId, "unread_for_school")) +
            1,
        }
      : {
          unread_for_support:
            (await getUnread(supabase, conversationId, "unread_for_support")) +
            1,
        };

    await (supabase as any)
      .from("support_conversations")
      .update(bump)
      .eq("id", conversationId);

    return NextResponse.json({ success: true, data: { message } });
  } catch (error: any) {
    console.error("POST /api/support/messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getUnread(
  supabase: any,
  conversationId: string,
  column: string
): Promise<number> {
  const { data } = await supabase
    .from("support_conversations")
    .select(column)
    .eq("id", conversationId)
    .maybeSingle();
  return data?.[column] || 0;
}
