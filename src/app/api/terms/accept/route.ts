// src/app/api/terms/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const db = supabase as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school associated' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const version = body?.version;

    if (!version || typeof version !== 'string') {
      return NextResponse.json(
        { error: 'version is required' },
        { status: 400 }
      );
    }

    const { data: termVersion } = await db
      .from('terms_versions')
      .select('version')
      .eq('version', version)
      .eq('scope', 'staff')
      .maybeSingle();

    if (!termVersion) {
      return NextResponse.json(
        { error: 'Unknown terms version' },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    const { error } = await db.from('legal_acceptances').upsert(
      {
        user_id: user.id,
        school_id: schoolId,
        scope: 'staff',
        version,
        documents: ['terms', 'privacy'],
        ip_address: ipAddress,
        user_agent: userAgent,
      },
      { onConflict: 'user_id,scope,version' }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/terms/accept error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
