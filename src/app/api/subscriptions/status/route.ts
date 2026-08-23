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
      .select('subscription_status, subscription_tier, subscription_expires_at')
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

    return NextResponse.json({
      success: true,
      subscription: {
        status: school?.subscription_status || 'trial',
        tier,
        expires_at: school?.subscription_expires_at || null,
        usage: { students: students || 0, staff: staff || 0 },
        limits,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
