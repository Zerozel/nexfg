import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generatePromoCode,
  resolveDuration,
  PROMO_DURATION_OPTIONS,
  type PromoTier,
} from "@/lib/promo-codes";

const VALID_TIERS: PromoTier[] = ["starter", "growth", "premium"];

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
 * GET  /api/super-admin/promo-codes
 *   Lists all promo codes with usage stats.
 *
 * POST /api/super-admin/promo-codes
 *   body: { target_tier, duration_option, description?, max_uses?, expires_at? }
 *   Creates a new promo code.
 */
export async function GET() {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const supabase = await createServerSupabase();

  const { data, error } = (await (supabase as any)
    .from("promo_codes")
    .select(
      `
      id,
      code,
      description,
      target_tier,
      duration_days,
      max_uses,
      uses_count,
      expires_at,
      revoked_at,
      created_at,
      created_by
    `
    )
    .order("created_at", { ascending: false })) as unknown as {
    data: any[] | null;
    error: unknown;
  };

  if (error) {
    return NextResponse.json({ error: "Failed to load codes" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { codes: data || [] } });
}

export async function POST(request: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;
  const { user } = guard;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { target_tier, duration_option, description, max_uses, expires_at } = body;

  if (!target_tier || !VALID_TIERS.includes(target_tier)) {
    return NextResponse.json(
      { error: `target_tier must be one of: ${VALID_TIERS.join(", ")}` },
      { status: 400 }
    );
  }

  const validDurationValues = PROMO_DURATION_OPTIONS.map((o) => o.value);
  if (!duration_option || !validDurationValues.includes(duration_option)) {
    return NextResponse.json(
      { error: `duration_option must be one of: ${validDurationValues.join(", ")}` },
      { status: 400 }
    );
  }

  let duration_days: number;
  try {
    duration_days = resolveDuration(duration_option);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const maxUsesNum = Number.isFinite(Number(max_uses)) ? Number(max_uses) : 1;
  if (maxUsesNum < 1) {
    return NextResponse.json({ error: "max_uses must be >= 1" }, { status: 400 });
  }

  // Generate a unique code — retry on collision (astronomically unlikely)
  const admin = createAdminClient();
  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generatePromoCode(target_tier);
    const { data: existing } = await admin
      .from("promo_codes")
      .select("id")
      .eq("code", candidate)
      .maybeSingle();
    if (!existing) {
      code = candidate;
      break;
    }
  }

  if (!code) {
    return NextResponse.json(
      { error: "Failed to generate a unique code — try again" },
      { status: 500 }
    );
  }

  const { data: created, error } = (await (admin as any)
    .from("promo_codes")
    .insert({
      code,
      description: typeof description === "string" ? description.trim() : null,
      target_tier,
      duration_days,
      max_uses: maxUsesNum,
      expires_at: expires_at || null,
      created_by: user.id,
    })
    .select()
    .single()) as unknown as { data: any; error: any };

  if (error) {
    console.error("promo_codes insert error:", error);
    return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { code: created } });
}
