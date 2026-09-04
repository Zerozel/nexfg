import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { class_id, subject_id } = body;

    if (!class_id || !subject_id) {
      return NextResponse.json(
        { error: 'class_id and subject_id are required' },
        { status: 400 }
      );
    }

    // Remove the teacher assignment (set teacher_id to null)
    const { error: updateError } = await supabase
      .from('class_subjects')
      .update({ teacher_id: null } as never)
      .eq('class_id', class_id)
      .eq('subject_id', subject_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher removed from subject successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/teacher/remove-subject error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}