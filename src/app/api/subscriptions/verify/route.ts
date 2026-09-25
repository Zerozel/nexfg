import { NextRequest, NextResponse } from 'next/server';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { verifyTransaction } from '@/lib/paystack/client';
import { daysFor, type BillingCycle } from '@/lib/paystack/plans';

/**
 * Confirms the outcome of a Paystack transaction for the returning user AND
 * activates the subscription if the webhook hasn't already done so.
 *
 * Rules:
 *   - Paystack says 'success'  → payment becomes 'success', school activates.
 *   - Paystack says 'failed' or 'reversed' → payment becomes 'failed'.
 *   - Any other state ('abandoned', 'ongoing', 'pending', unknown) → do
 *     nothing. The payment stays pending; it may resolve later via webhook or
 *     a subsequent verify call. We never downgrade a payment on ambiguity.
 *   - Idempotent — re-running on a success is a no-op.
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const reference = request.nextUrl.searchParams.get('reference');
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const { data: payment } = await supabase
      .from('subscription_payments')
      .select('id, status, plan, billing_cycle')
      .eq('reference', reference)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const result = await verifyTransaction(reference);
    const paystackStatus = result.data?.status ?? 'unknown';

    // Terminal failure states — safe to mark failed.
    const terminalFailures = new Set(['failed', 'reversed']);
    // Terminal success state.
    const isSuccess = result.status && paystackStatus === 'success';

    if (isSuccess) {
      // Ensure the payment row is flipped to success FIRST.
      if (payment.status !== 'success') {
        const { error: paymentUpdateError } = await supabase
          .from('subscription_payments')
          .update({
            status: 'success',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        if (paymentUpdateError) {
          console.error('[verify] payment update failed:', paymentUpdateError);
          throw paymentUpdateError;
        }
      }

      // Then activate the school — only if it isn't already active on this
      // plan, so we don't push the expiry forward on every page load.
      const { data: school } = await supabase
        .from('schools')
        .select('subscription_status, subscription_tier')
        .eq('id', schoolId)
        .maybeSingle();

      const needsActivation =
        !school ||
        school.subscription_status !== 'active' ||
        school.subscription_tier !== payment.plan;

      if (needsActivation) {
        const cycle: BillingCycle =
          payment.billing_cycle === 'session' ? 'session' : 'term';
        const days = daysFor(cycle);
        const expiresAt = new Date(
          Date.now() + days * 24 * 60 * 60 * 1000
        ).toISOString();

        const customer = result.data?.customer;

        const { error: schoolUpdateError } = await supabase
          .from('schools')
          .update({
            subscription_status: 'active',
            subscription_tier: payment.plan,
            subscription_expires_at: expiresAt,
            ...(customer?.customer_code
              ? { paystack_customer_code: customer.customer_code }
              : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', schoolId);

        if (schoolUpdateError) throw schoolUpdateError;
      }

      return NextResponse.json({
        success: true,
        status: 'success',
        reference,
      });
    }

    // Terminal failure — mark the payment failed, but only if it wasn't
    // already marked success (never downgrade).
    if (terminalFailures.has(paystackStatus) && payment.status !== 'success') {
      await supabase
        .from('subscription_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
    }

    // Any other state (abandoned, ongoing, pending, unknown) — leave as is.
    return NextResponse.json({
      success: false,
      status: paystackStatus,
      reference,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('[verify] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
