import { NextResponse } from 'next/server';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { PLAN_LIMITS } from '@/lib/paystack/plans';

export async function GET() {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const { data: school } = await supabase
      .from('schools')
      .select(
        'subscription_status, subscription_tier, subscription_expires_at'
      )
      .eq('id', schoolId)
      .single();

    const [{ count: students }, { count: staff }] = await Promise.all([
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .is('is_deleted', false),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .in('role', ['teacher', 'admin', 'principal'])
        .is('is_deleted', false),
    ]);

    const tier = school?.subscription_tier || 'free';
    const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.free;

    // Billing cycle + days until expiry come from the most recent successful
    // payment, if any.
    const { data: lastPayment } = await supabase
      .from('subscription_payments')
      .select('billing_cycle')
      .eq('school_id', schoolId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let daysUntilExpiry: number | null = null;
    if (school?.subscription_expires_at) {
      const expiry = new Date(school.subscription_expires_at).getTime();
      daysUntilExpiry = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      success: true,
      subscription: {
        status: school?.subscription_status || 'trial',
        tier,
        expires_at: school?.subscription_expires_at || null,
        billing_cycle: lastPayment?.billing_cycle || null,
        days_until_expiry: daysUntilExpiry,
        usage: { students: students || 0, staff: staff || 0 },
        limits,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
