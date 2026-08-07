import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/paystack/webhook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { event: eventType, data } = event;

    if (eventType === 'charge.success') {
      const { reference, metadata } = data;
      const schoolId = metadata?.school_id;
      const plan = metadata?.plan || 'growth';

      if (schoolId) {
        // Update payment record
        await supabase
          .from('subscription_payments')
          .update({ status: 'success' })
          .eq('reference', reference);

        // Update school subscription
        await supabase
          .from('schools')
          .update({
            subscription_status: 'active',
            subscription_tier: plan,
            subscription_expires_at: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // ~4 months (term)
            updated_at: new Date().toISOString(),
          })
          .eq('id', schoolId);
      }
    }

    if (eventType === 'charge.failed') {
      const { reference } = data;
      await supabase
        .from('subscription_payments')
        .update({ status: 'failed' })
        .eq('reference', reference);
    }

    if (eventType === 'subscription.disable' || eventType === 'subscription.expire') {
      const { customer } = data;
      // Find school by customer email and set inactive
      await supabase
        .from('schools')
        .update({ subscription_status: eventType === 'subscription.disable' ? 'inactive' : 'expired', updated_at: new Date().toISOString() })
        .eq('email', customer?.email);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
