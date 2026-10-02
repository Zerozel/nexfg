import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/broadcasts
 *   - super_admin: all broadcasts (active and inactive)
 *   - everyone else: only active broadcasts targeting their role
 *
 * POST /api/broadcasts — super_admin creates
 * PATCH /api/broadcasts — super_admin updates
 * DELETE /api/broadcasts?id=X — super_admin deletes
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.app_metadata?.role;

    if (role === "super_admin") {
      const { data, error } = (await supabase
        .from("broadcasts")
        .select("id, title, body, severity, target_roles, dismissible, is_active, starts_at, ends_at, created_at")
        .order("created_at", { ascending: false })) as unknown as {
        data: any[] | null;
        error: unknown;
      };
      if (error) throw error;
      return NextResponse.json({ success: true, data: { broadcasts: data || [] } });
    }

    // Everyone else: active + targeted at their role
    const { data, error } = (await supabase
      .from("broadcasts")
      .select("id, title, body, severity, dismissible, created_at")
      .eq("is_active", true)
      .lte("starts_at", new Date().toISOString())
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      .contains("target_roles", [role])
      .order("created_at", { ascending: false })) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (error) throw error;
    return NextResponse.json({ success: true, data: { broadcasts: data || [] } });
  } catch (error: any) {
    console.error("GET /api/broadcasts error:", error);
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
    if (user.app_metadata?.role !== "super_admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { title, body, severity, target_roles, dismissible, ends_at } =
      await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const { data, error } = (await (supabase as any)
      .from("broadcasts")
      .insert({
        title: String(title).trim(),
        body: String(body).trim(),
        severity: severity || "info",
        target_roles: target_roles && target_roles.length > 0
          ? target_roles
          : ["admin", "principal", "teacher"],
        dismissible: dismissible !== false,
        ends_at: ends_at || null,
        created_by: user.id,
      })
      .select("id, title, body, severity, target_roles, dismissible, is_active, starts_at, ends_at, created_at")
      .single()) as unknown as { data: any; error: unknown };

    if (error) throw error;

    return NextResponse.json({ success: true, data: { broadcast: data } });
  } catch (error: any) {
    console.error("POST /api/broadcasts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const { id, ...patch } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await (supabase as any)
      .from("broadcasts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/broadcasts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.app_metadata?.role !== "super_admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await (supabase as any).from("broadcasts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/broadcasts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
