// src/app/api/admin/teacher-assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listTeacherAssignments, assignTeacherToSubject } from '@/lib/supabase/admin';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { teacherAssignmentSchema } from '@/lib/validations/teacher-assignment.schema';
import { ZodError } from 'zod';

// ============================================================================
// ARCHITECTURAL NOTES
// ----------------------------------------------------------------------------
// Admin/principal only. POST is the second "front door" that triggers
// assessment provisioning via assignTeacherToSubject.
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase } = guard;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const assignments = await listTeacherAssignments(supabase, classId);
    return NextResponse.json({ data: assignments });
  } catch (error: any) {
    console.error('GET /api/admin/teacher-assignments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const body = await request.json();

    const validatedData = teacherAssignmentSchema.parse(body);

    const assignment = await assignTeacherToSubject(supabase, schoolId, validatedData);
    return NextResponse.json(
      {
        success: true,
        assignment: {
          id: assignment.id,
          class: assignment.class_name,
          subject: assignment.subject_name,
          teacher: assignment.teacher_name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('POST /api/admin/teacher-assignments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
