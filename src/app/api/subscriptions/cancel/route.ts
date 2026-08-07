import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolId = user.app_metadata?.school_id;

    const db = supabase as any;
    await db
      .from('schools')
      .update({ subscription_status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', schoolId);

    return NextResponse.json({ success: true, message: 'Subscription cancelled' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
