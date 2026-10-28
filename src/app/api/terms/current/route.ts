// src/app/api/terms/current/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const db = supabase as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentVersion } = await db
      .from('terms_versions')
      .select('version, effective_date, notes')
      .eq('scope', 'staff')
      .eq('is_current', true)
      .maybeSingle();

    if (!currentVersion) {
      return NextResponse.json(
        { error: 'No current terms version' },
        { status: 500 }
      );
    }

    const { data: acceptance } = await db
      .from('legal_acceptances')
      .select('accepted_at')
      .eq('user_id', user.id)
      .eq('scope', 'staff')
      .eq('version', currentVersion.version)
      .maybeSingle();

    return NextResponse.json({
      version: currentVersion.version,
      effective_date: currentVersion.effective_date,
      notes: currentVersion.notes,
      accepted: !!acceptance,
      accepted_at: acceptance?.accepted_at ?? null,
    });
  } catch (error: any) {
    console.error('GET /api/terms/current error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
