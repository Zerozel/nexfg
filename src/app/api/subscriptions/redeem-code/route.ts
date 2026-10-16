import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePromoCode, higherTier, type PromoTier } from "@/lib/promo-codes";

/**
 * POST /api/subscriptions/redeem-code
 * body: { code }
 *
 * Redeems a promo code for the caller's school.
 *
 * Rules:
 *   - Caller must be admin/principal of a school
 *   - Code must exist, be unrevoked, unexpired, under max_uses
 *   - School must not have redeemed this code before
 *   - On success: extends subscription_expires_at, raises tier if higher,
 *     sets status to 'active', records redemption row
 */
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

    if (!["admin", "principal"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (!schoolId) {
      return NextResponse.json({ error: "No school associated" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const rawCode = body?.code;
    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const code = normalizePromoCode(rawCode);
    const admin = createAdminClient();

    // ── Load the code ──
    const { data: promo, error: promoError } = (await (admin as any)
      .from("promo_codes")
      .select(
        "id, code, target_tier, duration_days, max_uses, uses_count, expires_at, revoked_at"
      )
      .eq("code", code)
      .maybeSingle()) as unknown as { data: any | null; error: any };

    if (promoError) {
      console.error("promo lookup error:", promoError);
      return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
    }

    if (!promo) {
      return NextResponse.json(
        { error: "This code is not valid", code: "INVALID_CODE" },
        { status: 404 }
      );
    }

    if (promo.revoked_at) {
      return NextResponse.json(
        { error: "This code has been revoked", code: "REVOKED" },
        { status: 410 }
      );
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This code has expired", code: "EXPIRED" },
        { status: 410 }
      );
    }

    if (promo.uses_count >= promo.max_uses) {
      return NextResponse.json(
        { error: "This code has already been fully used", code: "EXHAUSTED" },
        { status: 410 }
      );
    }

    // ── Has this school already redeemed it? ──
    const { data: existingRedemption } = (await (admin as any)
      .from("promo_code_redemptions")
      .select("id")
      .eq("promo_code_id", promo.id)
      .eq("school_id", schoolId)
      .maybeSingle()) as unknown as { data: any | null };

    if (existingRedemption) {
      return NextResponse.json(
        { error: "Your school has already used this code", code: "ALREADY_REDEEMED" },
        { status: 409 }
      );
    }

    // ── Load current school state ──
    const { data: school, error: schoolError } = (await (admin as any)
      .from("schools")
      .select("id, subscription_tier, subscription_status, subscription_expires_at")
      .eq("id", schoolId)
      .maybeSingle()) as unknown as { data: any | null; error: any };

    if (schoolError || !school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // ── Compute new state ──
    const now = new Date();
    const currentExpiry = school.subscription_expires_at
      ? new Date(school.subscription_expires_at)
      : null;
    const baseDate =
      currentExpiry && currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(
      baseDate.getTime() + promo.duration_days * 24 * 60 * 60 * 1000
    );

    const appliedTier = higherTier(
      school.subscription_tier,
      promo.target_tier as PromoTier
    );

    // ── Write redemption + update school atomically-ish ──
    const { error: redemptionError } = await (admin as any)
      .from("promo_code_redemptions")
      .insert({
        promo_code_id: promo.id,
        school_id: schoolId,
        redeemed_by: user.id,
        applied_tier: appliedTier,
        previous_tier: school.subscription_tier,
        previous_status: school.subscription_status,
        previous_expires_at: school.subscription_expires_at,
        new_expires_at: newExpiry.toISOString(),
      });

    if (redemptionError) {
      // UNIQUE violation = already redeemed (race condition safe)
      if (redemptionError.code === "23505") {
        return NextResponse.json(
          { error: "Your school has already used this code", code: "ALREADY_REDEEMED" },
          { status: 409 }
        );
      }
      console.error("redemption insert error:", redemptionError);
      return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
    }

    const { error: updateError } = await (admin as any)
      .from("schools")
      .update({
        subscription_tier: appliedTier,
        subscription_status: "active",
        subscription_expires_at: newExpiry.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", schoolId);

    if (updateError) {
      console.error("school update error:", updateError);
      // Redemption row is already written — try to roll back
      await (admin as any)
        .from("promo_code_redemptions")
        .delete()
        .eq("promo_code_id", promo.id)
        .eq("school_id", schoolId);
      return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
    }

    // ── Increment uses_count ──
    await (admin as any)
      .from("promo_codes")
      .update({
        uses_count: promo.uses_count + 1,
        updated_at: now.toISOString(),
      })
      .eq("id", promo.id);

    return NextResponse.json({
      success: true,
      data: {
        applied_tier: appliedTier,
        duration_days: promo.duration_days,
        new_expires_at: newExpiry.toISOString(),
        message: `Code applied. Your school now has ${appliedTier} access until ${newExpiry.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`,
      },
    });
  } catch (error: any) {
    console.error("redeem-code error:", error);
    return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
  }
}
