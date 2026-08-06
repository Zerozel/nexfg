import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getUnenrolledStudents } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const termId = searchParams.get('termId');

    if (!classId || !termId) {
      return NextResponse.json(
        { error: 'classId and termId are required' },
        { status: 400 }
      );
    }

    const students = await getUnenrolledStudents(supabase, classId, termId);
    return NextResponse.json({ data: students });
  } catch (error: any) {
    console.error('GET /api/admin/unenrolled-students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
