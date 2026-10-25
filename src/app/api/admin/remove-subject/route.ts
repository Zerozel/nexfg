// src/app/api/admin/remove-subject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * DELETE /api/admin/remove-subject
 * body: { class_id, subject_id }
 *
 * Removes a subject from a class entirely (deletes the class_subjects row).
 * To only unassign the teacher but keep the subject, use assign-subject
 * with teacher_id: null — but note that path isn't exposed in the UI.
 */
export async function DELETE(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const { class_id, subject_id } = body;

    if (!class_id || !subject_id) {
      return NextResponse.json(
        { error: 'class_id and subject_id are required' },
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

    const { error } = await db
      .from('class_subjects')
      .delete()
      .eq('class_id', class_id)
      .eq('subject_id', subject_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/admin/remove-subject error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
