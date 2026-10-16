import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireSuperAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "super_admin") {
    return { error: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  }
  return { user };
}

/**
 * DELETE /api/super-admin/promo-codes/[id]
 * Revokes a promo code (soft delete). Codes already redeemed stay valid
 * for the schools that redeemed them — only new redemptions are blocked.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await (admin as any)
    .from("promo_codes")
    .update({ revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);

  if (error) {
    console.error("promo_codes revoke error:", error);
    return NextResponse.json({ error: "Failed to revoke code" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
