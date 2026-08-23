import { NextRequest, NextResponse } from 'next/server';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { initializeTransaction } from '@/lib/paystack/client';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack/plans';

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, user, schoolId } = guard;

    const { plan } = await request.json();

    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const reference = `nexa-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const result = await initializeTransaction({
      email: user.email!,
      amount: planConfig.price,
      reference,
      metadata: { school_id: schoolId, plan },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${reference}`,
    });

    if (!result.status) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Record pending payment. school_id is also injected by the DB trigger, but
    // we set it explicitly for clarity.
    const { error: insertError } = await supabase
      .from('subscription_payments')
      .insert({
        school_id: schoolId,
        reference,
        amount: planConfig.price,
        currency: 'NGN',
        plan,
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
