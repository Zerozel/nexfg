import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    if (!['admin', 'principal', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    const { class_id, subject_id, teacher_id } = await request.json();
    if (!class_id || !subject_id || !teacher_id) {
      return NextResponse.json(
        { error: 'class_id, subject_id, teacher_id are required' },
        { status: 400 }
      );
    }

    // Cast to `any` because src/types/supabase.ts is still a placeholder —
    // Supabase infers `never[]` for the upsert payload without the real types.
    const db = supabase as any;

    const { error } = await db
      .from('class_subjects')
      .upsert(
        { class_id, subject_id, teacher_id },
        { onConflict: 'class_id,subject_id' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/admin/assign-subject error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
