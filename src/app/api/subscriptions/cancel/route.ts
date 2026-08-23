import { NextResponse } from 'next/server';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';

export async function POST() {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    // Checkout uses one-time Paystack transactions (not Paystack's recurring
    // Subscriptions API), so there is no remote subscription to disable — we
    // simply mark the school inactive. Access remains until expiry is enforced
    // by the app/cron based on subscription_status.
    const { error } = await supabase
      .from('schools')
      .update({
        subscription_status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', schoolId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
