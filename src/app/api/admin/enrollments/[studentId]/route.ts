import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { unenrollStudent } from '@/lib/supabase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
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

    await unenrollStudent(supabase, studentId, classId, termId);
    return NextResponse.json({
      success: true,
      message: 'Student unenrolled successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/enrollments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
