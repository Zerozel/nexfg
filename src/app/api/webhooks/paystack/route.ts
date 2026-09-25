import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/paystack/webhook';
import {
  SUBSCRIPTION_PLANS,
  daysFor,
  type BillingCycle,
} from '@/lib/paystack/plans';
import type { PaystackWebhookEvent } from '@/lib/paystack/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    if (!verifyWebhookSignature(body, signature)) {
      console.warn('[webhook] invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body) as PaystackWebhookEvent;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { event: eventType, data } = event;
    console.log(
      `[webhook] ${eventType} ref=${data.reference} school=${data.metadata?.school_id}`
    );

    if (eventType === 'charge.success') {
      const { reference, metadata, customer, subscription } = data;
      const schoolId = metadata?.school_id;
      const plan = metadata?.plan;
      const cycle: BillingCycle =
        metadata?.billing_cycle === 'session' ? 'session' : 'term';

      if (schoolId && plan && SUBSCRIPTION_PLANS[plan]) {
        // Load the payment row first — if it isn't there, we can't attribute
        // the charge and we log loudly rather than silently activating.
        const { data: payment } = await supabase
          .from('subscription_payments')
          .select('id, status, school_id')
          .eq('reference', reference)
          .maybeSingle();

        if (!payment) {
          console.warn(
            `[webhook] no payment row for ref=${reference} — school not activated`
          );
          return NextResponse.json(
            { received: true, warning: 'no payment row' },
            { status: 200 }
          );
        }

        // Only proceed if the payment belongs to the claimed school.
        if (payment.school_id !== schoolId) {
          console.warn(
            `[webhook] payment/school mismatch ref=${reference} claimed=${schoolId} actual=${payment.school_id}`
          );
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Idempotency: if already success, do nothing.
        if (payment.status === 'success') {
          console.log(`[webhook] ref=${reference} already success`);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // 1. Update the payment row FIRST.
        const { error: paymentUpdateError } = await supabase
          .from('subscription_payments')
          .update({
            status: 'success',
            billing_cycle: cycle,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        if (paymentUpdateError) {
          console.error('[webhook] payment update failed:', paymentUpdateError);
          throw paymentUpdateError;
        }

        // 2. Now activate the school.
        const days = daysFor(cycle);
        const expiresAt = new Date(
          Date.now() + days * 24 * 60 * 60 * 1000
        ).toISOString();

        const { error: schoolUpdateError } = await supabase
          .from('schools')
          .update({
            subscription_status: 'active',
            subscription_tier: plan,
            subscription_expires_at: expiresAt,
            ...(customer?.customer_code
              ? { paystack_customer_code: customer.customer_code }
              : {}),
            ...(subscription?.subscription_code
              ? {
                  paystack_subscription_code: subscription.subscription_code,
                }
              : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', schoolId);

        if (schoolUpdateError) {
          console.error('[webhook] school update failed:', schoolUpdateError);
          throw schoolUpdateError;
        }

        console.log(
          `[webhook] activated ${plan} (${cycle}) for school ${schoolId} until ${expiresAt}`
        );
      } else {
        console.warn(
          `[webhook] charge.success missing school/plan ref=${reference}`
        );
      }
    }

    if (eventType === 'charge.failed') {
      const { reference } = data;
      // Only mark failed if the payment isn't already success — a late
      // charge.failed event must never downgrade a confirmed payment.
      const { data: existing } = await supabase
        .from('subscription_payments')
        .select('status')
        .eq('reference', reference)
        .maybeSingle();

      if (existing && existing.status !== 'success') {
        await supabase
          .from('subscription_payments')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('reference', reference);
      } else if (!existing) {
        console.warn(
          `[webhook] charge.failed for unknown ref=${reference} — no row to update`
        );
      }
    }

    if (
      eventType === 'subscription.disable' ||
      eventType === 'subscription.expire'
    ) {
      const nextStatus =
        eventType === 'subscription.disable' ? 'inactive' : 'expired';

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

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('[webhook] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
