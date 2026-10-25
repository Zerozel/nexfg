import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * POST /api/auth/forgot-password
 * body: { email: string }
 *
 * Sends a password reset email via Supabase Auth (which routes through
 * the configured custom SMTP → Resend).
 *
 * MUST be called server-side so the PKCE code_verifier is stored in a
 * cookie, not in the browser's memory. Without this, users who open the
 * reset link in a different tab or browser get a broken flow.
 *
 * Always returns success to prevent email enumeration attacks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nexaforges.me";

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${siteUrl}/auth/reset-password`,
      }
    );

    if (error) {
      // Log for debugging but don't leak to the caller
      console.error("Password reset error:", error.message);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password route error:", error);
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 }
    );
  }
}
