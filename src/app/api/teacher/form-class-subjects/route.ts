import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    const searchParams = new URL(request.url).searchParams;
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    // Get all subjects for the school
    const { data: allSubjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .order('name');

    if (subjectsError) throw subjectsError;

    // Get active subjects for this class
    const { data: classSubjects, error: classError } = await supabase
      .from('class_subjects')
      .select('subject_id, teacher_id')
      .eq('class_id', classId);

    if (classError) throw classError;

    const activeIds = (classSubjects || []).map((cs: any) => cs.subject_id);
    const teacherMap = new Map();
    (classSubjects || []).forEach((cs: any) => {
      teacherMap.set(cs.subject_id, cs.teacher_id);
    });

    const active = (allSubjects || []).filter((s: any) => activeIds.includes(s.id));
    const available = (allSubjects || []).filter((s: any) => !activeIds.includes(s.id));

    return NextResponse.json({
      success: true,
      data: {
        active,
        available,
        total: allSubjects?.length || 0,
        active_count: active.length,
        teacher_map: Object.fromEntries(teacherMap),
      },
    });
  } catch (error: any) {
    console.error('GET /api/teacher/form-class-subjects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { class_id, subject_ids } = body;

    if (!class_id || !subject_ids || !Array.isArray(subject_ids)) {
      return NextResponse.json(
        { error: 'class_id and subject_ids array are required' },
        { status: 400 }
      );
    }

    // Get existing teacher assignments to preserve them
    const { data: existing, error: existingError } = await supabase
      .from('class_subjects')
      .select('subject_id, teacher_id')
      .eq('class_id', class_id);

    if (existingError) throw existingError;

    const teacherMap = new Map();
    (existing || []).forEach((record: any) => {
      teacherMap.set(record.subject_id, record.teacher_id);
    });

    // Delete all existing class_subjects for this class
    const { error: deleteError } = await supabase
      .from('class_subjects')
      .delete()
      .eq('class_id', class_id);

    if (deleteError) throw deleteError;

    // Insert new ones, preserving teacher_id if it existed
    if (subject_ids.length > 0) {
      const insertData = subject_ids.map((subject_id: string) => ({
        class_id,
        subject_id,
        teacher_id: teacherMap.get(subject_id) || null,
      }));

      const { error: insertError } = await supabase
        .from('class_subjects')
        .insert(insertData as never[]);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: `Subjects updated: ${subject_ids.length} active`,
    });
  } catch (error: any) {
    console.error('PUT /api/teacher/form-class-subjects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}