import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    const body = await request.json();
    const { class_id, subject_id, teacher_id } = body;

    if (!class_id || !subject_id || !teacher_id) {
      return NextResponse.json(
        { error: 'class_id, subject_id, and teacher_id are required' },
        { status: 400 }
      );
    }

    // Verify teacher belongs to the school
    const { data: teacher, error: teacherError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', teacher_id)
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found or not in this school' },
        { status: 404 }
      );
    }

    // Upsert the class_subjects record
    const { error: upsertError } = await supabase
      .from('class_subjects')
      .upsert({
        class_id,
        subject_id,
        teacher_id,
      } as never, {
        onConflict: 'class_id,subject_id',
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher assigned to subject successfully',
    });
  } catch (error: any) {
    console.error('POST /api/teacher/assign-subject error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}