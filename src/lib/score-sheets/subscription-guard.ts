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
 * school is on a paid tier (starter, growth, premium).
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
    .select("subscription_tier")
    .eq("id", schoolId)
    .maybeSingle()) as unknown as {
    data: { subscription_tier: string | null } | null;
  };

  const tier = school?.subscription_tier || "free";
  const paidTiers = ["starter", "growth", "premium"];

  if (!paidTiers.includes(tier)) {
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
