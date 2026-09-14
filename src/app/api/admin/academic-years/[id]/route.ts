// src/app/api/admin/academic-years/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from '@/lib/supabase/admin';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { academicYearUpdateSchema } from '@/lib/validations/academic-year.schema';

import { ZodError } from 'zod';

// ============================================================================
// ARCHITECTURAL NOTES
// ----------------------------------------------------------------------------
// Same pattern as the collection route: admin/principal only, RLS-enforced
// client via requireSchoolAdmin, and every admin.ts call receives schoolId.
// Ids in the URL are not trusted — every query inside admin.ts is scoped by
// school_id, so a caller cannot read/update/delete another school's row even
// if they guess a valid UUID.
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    // ← CHANGED: pass schoolId into getAcademicYear so a cross-tenant id read
    //   returns PGRST116 (not found) rather than another school's row.
    const academicYear = await getAcademicYear(supabase, schoolId, id);
    return NextResponse.json({ data: academicYear });
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
    const { supabase, schoolId } = guard;

    const body = await request.json();
    const validatedData = academicYearUpdateSchema.parse(body);

    // ← CHANGED: pass schoolId. admin.ts scopes the update and, when
    //   is_current=true, calls clearCurrentAcademicYear scoped to this school
    //   only — so toggling current no longer demotes other schools.
    const academicYear = await updateAcademicYear(supabase, schoolId, id, validatedData);
    return NextResponse.json({
      data: academicYear,
      message: 'Academic year updated successfully',
    });
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
    const { supabase, schoolId } = guard;

    // ← CHANGED: pass schoolId so a cross-tenant delete is a no-op.
    await deleteAcademicYear(supabase, schoolId, id);
    return NextResponse.json({ message: 'Academic year deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
