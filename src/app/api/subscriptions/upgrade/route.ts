import { NextRequest, NextResponse } from 'next/server';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { initializeTransaction } from '@/lib/paystack/client';
import { SUBSCRIPTION_PLANS, priceFor, type BillingCycle } from '@/lib/paystack/plans';

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, user, schoolId } = guard;

    const body = await request.json();
    const { plan, billing_cycle } = body as {
      plan: string;
      billing_cycle?: BillingCycle;
    };

    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const cycle: BillingCycle =
      billing_cycle === 'session' ? 'session' : 'term';

    const amount = priceFor(plan, cycle);

    const reference = `nexa-upgrade-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    // Prefer the env var; fall back to the request origin so a missing
    // NEXT_PUBLIC_APP_URL can never send users to Paystack's default page.
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // An upgrade is a fresh Paystack checkout. The tier only actually changes
    // once payment is confirmed via the charge.success webhook (or the verify
    // fallback) — never optimistically.
    const result = await initializeTransaction({
      email: user.email!,
      amount,
      reference,
      metadata: {
        school_id: schoolId,
        plan,
        billing_cycle: cycle,
        upgrade: true,
      },
      callback_url: `${appUrl}/payment/success?reference=${reference}`,
    });

    if (!result.status) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('subscription_payments')
      .insert({
        school_id: schoolId,
        reference,
        amount,
        currency: 'NGN',
        plan,
        billing_cycle: cycle,
        status: 'pending',
      });

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      authorization_url: result.data.authorization_url,
      reference,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
