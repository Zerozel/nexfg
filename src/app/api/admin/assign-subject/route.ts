// src/app/api/admin/assign-subject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * POST /api/admin/assign-subject
 * body: { class_id, subject_id, teacher_id }
 *
 * Assigns a teacher to a subject for ONE class. For bulk assignment across
 * a class group, use POST /api/admin/subject-assignment with base_name.
 *
 * Idempotent: upserts on (class_id, subject_id).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    if (!['admin', 'principal', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school associated' },
        { status: 403 }
      );
    }

    const { class_id, subject_id, teacher_id } = await request.json();
    if (!class_id || !subject_id || !teacher_id) {
      return NextResponse.json(
        { error: 'class_id, subject_id, teacher_id are required' },
        { status: 400 }
      );
    }

    const db = supabase as any;

    // Verify class belongs to this school
    const { data: cls } = await db
      .from('classes')
      .select('id')
      .eq('id', class_id)
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .maybeSingle();

    if (!cls) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify subject belongs to this school
    const { data: subject } = await db
      .from('subjects')
      .select('id')
      .eq('id', subject_id)
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .maybeSingle();

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Verify teacher belongs to this school
    const { data: teacher } = await db
      .from('profiles')
      .select('id')
      .eq('id', teacher_id)
      .eq('school_id', schoolId)
      .in('role', ['teacher', 'admin', 'principal'])
      .eq('is_deleted', false)
      .maybeSingle();

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Upsert on (class_id, subject_id). Requires the unique constraint
    // class_subjects_class_id_subject_id_key to be the only one on that
    // column pair.
    const { error } = await db.from('class_subjects').upsert(
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
