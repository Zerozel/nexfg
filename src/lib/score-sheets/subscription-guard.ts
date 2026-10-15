import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export type SubscriptionGuardResult =
  | {
      authorized: true;
      userId: string;
      schoolId: string;
    }
  | {
      authorized: false;
      response: NextResponse;
    };

/**
 * Verifies the caller is an authenticated school admin/principal AND their
 * school is on a paid, active tier. Score sheets are a paid-tier feature.
 *
 * Rejects:
 *   - Unauthenticated users (401)
 *   - Non-admin roles (403)
 *   - Users without a school association (403)
 *   - Soft-deleted schools (403)
 *   - Schools on free tier, regardless of status (402)
 *   - Schools on trial status, even on paid tiers (402)
 *   - Schools with inactive status (402)
 */
export async function requirePaidAdmin(): Promise<SubscriptionGuardResult> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = user.app_metadata?.role;
  const schoolId = user.app_metadata?.school_id;

  if (!["admin", "principal"].includes(role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }),
    };
  }

  if (!schoolId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "No school associated" },
        { status: 403 }
      ),
    };
  }

  const { data: school } = (await supabase
    .from("schools")
    .select("subscription_tier, subscription_status")
    .eq("id", schoolId)
    .eq("is_deleted", false)
    .maybeSingle()) as unknown as {
    data: {
      subscription_tier: string | null;
      subscription_status: string | null;
    } | null;
  };

  if (!school) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "School not found or inactive" },
        { status: 403 }
      ),
    };
  }

  const tier = school.subscription_tier || "free";
  const status = school.subscription_status || "inactive";

  // Score Sheets require a paid tier AND an active subscription.
  // Per product spec, trials are excluded even on paid tiers.
  const paidTiers = ["starter", "growth", "premium"];
  const allowedStatuses = ["active"];

  if (!paidTiers.includes(tier) || !allowedStatuses.includes(status)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error:
            "Score sheets are available on paid plans. Upgrade to use this feature.",
          code: "UPGRADE_REQUIRED",
        },
        { status: 402 }
      ),
    };
  }

  return {
    authorized: true,
    userId: user.id,
    schoolId: schoolId as string,
  };
}
