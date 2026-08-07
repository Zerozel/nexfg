import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { PLAN_LIMITS } from '@/lib/paystack/plans';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolId = user.app_metadata?.school_id;

    const db = supabase as any;
    const { data: school } = await db
      .from('schools')
      .select('subscription_status, subscription_tier, subscription_expires_at')
      .eq('id', schoolId)
      .single();

    const [{ count: students }, { count: staff }] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).is('is_deleted', false),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('role', ['teacher', 'admin', 'principal']).is('is_deleted', false),
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
