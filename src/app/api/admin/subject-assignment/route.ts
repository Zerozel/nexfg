// src/app/api/admin/subject-assignment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * GET  /api/admin/subject-assignment?baseName=JSS 1
 *   Full matrix: every subject in the school × every arm sharing baseName,
 *   with the current teacher per cell.
 *
 * POST /api/admin/subject-assignment
 *   body: { class_id, subject_id, teacher_id }   ← one arm
 *      or { base_name, subject_id, teacher_id }  ← all arms
 *
 *   teacher_id: null → unassign (delete the row)
 *   teacher_id: string → upsert with that teacher
 *
 * Model A note: classes are permanent containers. No academic_year_id
 * filtering anywhere in this route.
 */

async function authorize() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { error: 'Unauthorized', status: 401, supabase, schoolId: null };

  const role = user.app_metadata?.role;
  if (!['admin', 'principal', 'super_admin'].includes(role)) {
    return { error: 'Forbidden', status: 403, supabase, schoolId: null };
  }

  const schoolId = user.app_metadata?.school_id;
  if (!schoolId) {
    return {
      error: 'No school associated',
      status: 403,
      supabase,
      schoolId: null,
    };
  }

  return { error: null, status: 200, supabase, schoolId };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authorize();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, schoolId } = auth;
    const db = supabase as any;

    const { searchParams } = new URL(request.url);
    const baseName = searchParams.get('baseName');
    if (!baseName) {
      return NextResponse.json(
        { error: 'baseName is required' },
        { status: 400 }
      );
    }

    const { data: arms, error: armsError } = await db
      .from('classes')
      .select('id, name, base_name, display_order')
      .eq('school_id', schoolId)
      .eq('base_name', baseName)
      .is('is_deleted', false)
      .order('name', { ascending: true });

    if (armsError) throw armsError;
    if (!arms || arms.length === 0) {
      return NextResponse.json(
        { error: 'No classes found for this group' },
        { status: 404 }
      );
    }

    const { data: subjects, error: subjectsError } = await db
      .from('subjects')
      .select('id, name, code')
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .order('name', { ascending: true });

    if (subjectsError) throw subjectsError;

    const armIds = (arms as any[]).map((a) => a.id);
    const { data: assignments, error: assignError } = await db
      .from('class_subjects')
      .select('id, class_id, subject_id, teacher_id')
      .in('class_id', armIds);

    if (assignError) throw assignError;

    const { data: teachers, error: teachersError } = await db
      .from('profiles')
      .select('id, full_name')
      .eq('school_id', schoolId)
      .in('role', ['teacher', 'admin', 'principal'])
      .eq('is_deleted', false)
      .order('full_name', { ascending: true });

    if (teachersError) throw teachersError;

    const assignmentMap = new Map<string, Map<string, any>>();
    for (const a of (assignments || []) as any[]) {
      if (!assignmentMap.has(a.subject_id)) {
        assignmentMap.set(a.subject_id, new Map());
      }
      assignmentMap.get(a.subject_id)!.set(a.class_id, a);
    }

    // Explicit typing so TypeScript does not infer `Map<any, any>`.
    const teacherMap = new Map<string, string>(
      ((teachers || []) as any[]).map(
        (t) => [t.id as string, t.full_name as string] as [string, string]
      )
    );

    const matrix = ((subjects || []) as any[]).map((subject) => {
      const perArm: Record<
        string,
        {
          class_subject_id: string | null;
          teacher_id: string | null;
          teacher_name: string | null;
        }
      > = {};

      for (const arm of arms as any[]) {
        const existing = assignmentMap.get(subject.id)?.get(arm.id);
        const teacherId: string | null = existing?.teacher_id ?? null;
        perArm[arm.id] = {
          class_subject_id: existing?.id ?? null,
          teacher_id: teacherId,
          teacher_name: teacherId ? teacherMap.get(teacherId) || null : null,
        };
      }

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        per_arm: perArm,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        base_name: baseName,
        arms,
        subjects: matrix,
        teachers: teachers || [],
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/subject-assignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorize();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, schoolId } = auth;
    const db = supabase as any;

    const body = await request.json();
    const subjectId = body.subject_id as string | undefined;
    const teacherId = body.teacher_id as string | null | undefined;
    const classId = body.class_id as string | undefined;
    const baseName = body.base_name as string | undefined;

    if (!subjectId) {
      return NextResponse.json(
        { error: 'subject_id is required' },
        { status: 400 }
      );
    }
    if (!classId && !baseName) {
      return NextResponse.json(
        { error: 'Either class_id or base_name is required' },
        { status: 400 }
      );
    }

    // Verify subject belongs to school
    const { data: subject } = await db
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .maybeSingle();

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Resolve target class IDs
    let targetClassIds: string[] = [];

    if (classId) {
      const { data: cls } = await db
        .from('classes')
        .select('id')
        .eq('id', classId)
        .eq('school_id', schoolId)
        .is('is_deleted', false)
        .maybeSingle();

      if (!cls) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }
      targetClassIds = [classId];
    } else {
      const { data: arms } = await db
        .from('classes')
        .select('id')
        .eq('school_id', schoolId)
        .eq('base_name', baseName!)
        .is('is_deleted', false);

      if (!arms || arms.length === 0) {
        return NextResponse.json(
          { error: 'No classes found for this group' },
          { status: 404 }
        );
      }
      targetClassIds = (arms as any[]).map((a) => a.id);
    }

    // Unassign path
    if (teacherId === null || teacherId === undefined || teacherId === '') {
      const { error: delError } = await db
        .from('class_subjects')
        .delete()
        .eq('subject_id', subjectId)
        .in('class_id', targetClassIds);

      if (delError) throw delError;

      return NextResponse.json({
        success: true,
        data: {
          action: 'unassigned',
          affected: targetClassIds.length,
        },
      });
    }

    // Verify teacher belongs to school
    const { data: teacher } = await db
      .from('profiles')
      .select('id')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .in('role', ['teacher', 'admin', 'principal'])
      .eq('is_deleted', false)
      .maybeSingle();

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Assign path
    const rows = targetClassIds.map((cid) => ({
      class_id: cid,
      subject_id: subjectId,
      teacher_id: teacherId,
    }));

    const { error: upsertError } = await db
      .from('class_subjects')
      .upsert(rows, { onConflict: 'class_id,subject_id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      success: true,
      data: {
        action: 'assigned',
        affected: rows.length,
      },
    });
  } catch (error: any) {
    console.error('POST /api/admin/subject-assignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
