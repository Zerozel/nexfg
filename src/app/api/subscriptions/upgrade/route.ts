import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { initializeTransaction } from '@/lib/paystack/client';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack/plans';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolId = user.app_metadata?.school_id;
    const { plan } = await request.json();

    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const reference = `nexa-upgrade-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const result = await initializeTransaction({
      email: user.email!,
      amount: planConfig.price,
      reference,
      metadata: { school_id: schoolId, plan, upgrade: true },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${reference}`,
    });

    if (!result.status) return NextResponse.json({ error: result.message }, { status: 400 });

    const db = supabase as any;
    await db.from('subscription_payments').insert({
      school_id: schoolId,
      reference,
      amount: planConfig.price,
      currency: 'NGN',
      plan,
      status: 'pending',
    });

    return NextResponse.json({ success: true, authorization_url: result.data.authorization_url, reference });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
