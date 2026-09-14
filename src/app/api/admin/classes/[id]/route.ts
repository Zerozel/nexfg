// src/app/api/admin/classes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClass, updateClass, deleteClass } from '@/lib/supabase/admin';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { classSchema } from '@/lib/validations/class.schema';
import { ZodError } from 'zod';

// ============================================================================
// ARCHITECTURAL NOTES
// ----------------------------------------------------------------------------
// Admin/principal only. RLS-enforced client via requireSchoolAdmin. Every call
// into admin.ts receives the caller's schoolId.
//
// The PUT handler is the other place where class contamination could occur:
// admin.ts::updateClass verifies that a new academic_year_id belongs to the
// caller's school before allowing the change.
//
// getClass and deleteClass remain 2-arg (supabase, id). They are safe because
// the RLS-enforced client scopes them: a cross-tenant id returns PGRST116
// (not found) and the delete is a no-op. Phase 5 will add explicit schoolId
// params to those functions for defense in depth.
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase } = guard;

    const classData = await getClass(supabase, id);
    return NextResponse.json({ data: classData });
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;   // ← CHANGED: pull schoolId from guard

    const body = await request.json();

    const validatedData = classSchema.partial().parse(body);

    // ← CHANGED: pass schoolId. admin.ts::updateClass:
    //   1. Verifies any new academic_year_id belongs to this school
    //   2. Scopes the UPDATE by school_id so cross-tenant ids cannot be modified
    const classData = await updateClass(supabase, schoolId, id, validatedData as any);
    return NextResponse.json({ data: classData, message: 'Class updated successfully' });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase } = guard;

    await deleteClass(supabase, id);
    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
