import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { removeTeacherAssignment } from '@/lib/supabase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    await removeTeacherAssignment(supabase, id);
    return NextResponse.json({
      success: true,
      message: 'Teacher assignment removed successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/teacher-assignments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
