import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Admin-scoped equivalent of /api/teacher/form-class-subjects.
 * Same logic, wider permission check — admin / principal only.
 */

async function authorize() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401, supabase, user: null, schoolId: null };

  const role = user.app_metadata?.role;
  if (!['admin', 'principal', 'super_admin'].includes(role)) {
    return { error: 'Forbidden', status: 403, supabase, user, schoolId: null };
  }

  const schoolId = user.app_metadata?.school_id;
  if (!schoolId) {
    return { error: 'No school associated', status: 403, supabase, user, schoolId: null };
  }

  return { error: null, status: 200, supabase, user, schoolId };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authorize();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, schoolId } = auth;

    const classId = new URL(request.url).searchParams.get('classId');
    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const { data: allSubjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .order('name');

    if (subjectsError) throw subjectsError;

    const { data: classSubjects, error: classError } = await supabase
      .from('class_subjects')
      .select('subject_id, teacher_id')
      .eq('class_id', classId);

    if (classError) throw classError;

    const activeIds = (classSubjects || []).map((cs: any) => cs.subject_id);
    const teacherMap: Record<string, string> = {};
    (classSubjects || []).forEach((cs: any) => {
      if (cs.teacher_id) teacherMap[cs.subject_id] = cs.teacher_id;
    });

    const active = (allSubjects || [])
      .filter((s: any) => activeIds.includes(s.id))
      .map((s: any) => ({ ...s, teacher_id: teacherMap[s.id] || null }));
    const available = (allSubjects || []).filter(
      (s: any) => !activeIds.includes(s.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        active,
        available,
        total: allSubjects?.length || 0,
        active_count: active.length,
        teacher_map: teacherMap,
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/form-class-subjects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authorize();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase } = auth;

    const body = await request.json();
    const { class_id, subject_ids } = body;

    if (!class_id || !subject_ids || !Array.isArray(subject_ids)) {
      return NextResponse.json(
        { error: 'class_id and subject_ids array are required' },
        { status: 400 }
      );
    }

    // Preserve teacher assignments
    const { data: existing } = await supabase
      .from('class_subjects')
      .select('subject_id, teacher_id')
      .eq('class_id', class_id);

    const teacherMap = new Map<string, string | null>();
    (existing || []).forEach((record: any) => {
      teacherMap.set(record.subject_id, record.teacher_id);
    });

    // Replace the set — delete then insert
    const { error: deleteError } = await supabase
      .from('class_subjects')
      .delete()
      .eq('class_id', class_id);

    if (deleteError) throw deleteError;

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
    console.error('PUT /api/admin/form-class-subjects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
