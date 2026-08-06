import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getUnassignedSubjectsForClass } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const subjects = await getUnassignedSubjectsForClass(supabase, classId);
    return NextResponse.json({ data: subjects });
  } catch (error: any) {
    console.error('GET /api/admin/unassigned-subjects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
