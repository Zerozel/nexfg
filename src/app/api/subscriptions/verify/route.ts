import { NextRequest, NextResponse } from 'next/server';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { verifyTransaction } from '@/lib/paystack/client';
import { daysFor, type BillingCycle } from '@/lib/paystack/plans';

/**
 * Confirms the outcome of a Paystack transaction for the returning user AND
 * activates the subscription if the webhook hasn't already done so.
 *
 * The webhook remains the authoritative path, but this endpoint is a fallback
 * so a slow/unreachable webhook can never leave a paid school stuck on pending.
 * Idempotent: if the payment is already marked successful, no writes happen.
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

    // Confirm ownership
    const { data: payment } = await supabase
      .from('subscription_payments')
      .select('id, status, plan, billing_cycle, amount')
      .eq('reference', reference)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const result = await verifyTransaction(reference);
    const paidOk = result.status && result.data?.status === 'success';

    if (!paidOk) {
      return NextResponse.json({
        success: false,
        status: result.data?.status ?? 'unknown',
        reference,
      });
    }

    // Idempotency: only activate once.
    if (payment.status === 'success') {
      return NextResponse.json({
        success: true,
        status: 'success',
        reference,
        already_activated: true,
      });
    }

    // Fallback activation: mark payment success, extend the school.
    const cycle: BillingCycle =
      payment.billing_cycle === 'session' ? 'session' : 'term';
    const days = daysFor(cycle);

    const { error: updatePaymentError } = await supabase
      .from('subscription_payments')
      .update({ status: 'success', updated_at: new Date().toISOString() })
      .eq('id', payment.id);

    if (updatePaymentError) throw updatePaymentError;

    const customer = result.data?.customer;
    const expiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: updateSchoolError } = await supabase
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

    if (updateSchoolError) throw updateSchoolError;

    console.log(
      `[verify] Fallback-activated subscription for school ${schoolId}, ref ${reference}, cycle=${cycle}`
    );

    return NextResponse.json({
      success: true,
      status: 'success',
      reference,
      activated: true,
      expires_at: expiresAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('[verify] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
