import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/paystack/webhook';
import { PLAN_TERM_DAYS, SUBSCRIPTION_PLANS } from '@/lib/paystack/plans';
import type { PaystackWebhookEvent } from '@/lib/paystack/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body) as PaystackWebhookEvent;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { event: eventType, data } = event;

    if (eventType === 'charge.success') {
      const { reference, metadata, customer, subscription } = data;
      const schoolId = metadata?.school_id;
      const plan = metadata?.plan;

      // Ignore charges we can't attribute to a school, or with an unknown plan.
      // Silently defaulting a bad/missing plan could grant the wrong tier.
      if (schoolId && plan && SUBSCRIPTION_PLANS[plan]) {
        // Idempotency: Paystack may deliver the same event more than once. Only
        // process a payment whose record isn't already marked successful, so a
        // redelivery can't extend the term twice.
        const { data: payment } = await supabase
          .from('subscription_payments')
          .select('status')
          .eq('reference', reference)
          .maybeSingle();

        if (!payment || payment.status !== 'success') {
          // Mark payment as successful
          await supabase
            .from('subscription_payments')
            .update({ status: 'success', updated_at: new Date().toISOString() })
            .eq('reference', reference);

          // Activate/extend the school subscription
          const expiresAt = new Date(
            Date.now() + PLAN_TERM_DAYS * 24 * 60 * 60 * 1000
          ).toISOString();

          await supabase
            .from('schools')
            .update({
              subscription_status: 'active',
              subscription_tier: plan,
              subscription_expires_at: expiresAt,
              // Persist Paystack identifiers so lifecycle events can be matched
              // back to this school later (see subscription.disable/expire).
              ...(customer?.customer_code
                ? { paystack_customer_code: customer.customer_code }
                : {}),
              ...(subscription?.subscription_code
                ? { paystack_subscription_code: subscription.subscription_code }
                : {}),
              updated_at: new Date().toISOString(),
            })
            .eq('id', schoolId);
        }
      }
    }

    if (eventType === 'charge.failed') {
      const { reference } = data;
      // Only the payment ledger is touched; the school's subscription_status is
      // deliberately left unchanged so a failed charge can't downgrade an
      // already-active school.
      await supabase
        .from('subscription_payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('reference', reference);
    }

    if (
      eventType === 'subscription.disable' ||
      eventType === 'subscription.expire'
    ) {
      const nextStatus =
        eventType === 'subscription.disable' ? 'inactive' : 'expired';

      // These events do NOT carry our metadata (school_id), so match on the
      // Paystack identifiers we persisted during charge.success. Prefer the
      // subscription code, then the customer code. Matching on schools.email is
      // unreliable (it's the school's contact email, not necessarily the payer).
      const subscriptionCode =
        data.subscription_code || data.subscription?.subscription_code;
      const customerCode = data.customer?.customer_code;

      if (subscriptionCode) {
        await supabase
          .from('schools')
          .update({
            subscription_status: nextStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('paystack_subscription_code', subscriptionCode);
      } else if (customerCode) {
        await supabase
          .from('schools')
          .update({
            subscription_status: nextStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('paystack_customer_code', customerCode);
      }
    }

    // Always acknowledge receipt so Paystack stops retrying.
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
