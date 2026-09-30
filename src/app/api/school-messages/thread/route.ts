import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    const schoolId = user.app_metadata?.school_id;
    const conversationId = new URL(request.url).searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const { data: convo, error: convoError } = (await supabase
      .from("school_conversations")
      .select("id, school_id, teacher_user_id, unread_for_admin, unread_for_teacher")
      .eq("id", conversationId)
      .maybeSingle()) as unknown as { data: any | null; error: unknown };

    if (convoError) throw convoError;
    if (!convo) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isTeacherOwn = convo.teacher_user_id === user.id;
    const isAdminInSchool =
      ["admin", "principal"].includes(role) && convo.school_id === schoolId;

    if (!isTeacherOwn && !isAdminInSchool) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: messages, error } = (await supabase
      .from("school_messages")
      .select("id, conversation_id, sender_id, sender_role, body, read_at, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (error) throw error;

    // Clear the caller's unread counter
    const reset = isTeacherOwn
      ? { unread_for_teacher: 0 }
      : { unread_for_admin: 0 };
    await (supabase as any)
      .from("school_conversations")
      .update(reset)
      .eq("id", conversationId);

    return NextResponse.json({
      success: true,
      data: { messages: messages || [] },
    });
  } catch (error: any) {
    console.error("GET /api/school-messages/thread error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
