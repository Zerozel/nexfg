// src/app/api/admin/classes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listClasses, createClass } from '@/lib/supabase/admin';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { classSchema } from '@/lib/validations/class.schema';
import { ZodError } from 'zod';

// ============================================================================
// ARCHITECTURAL NOTES
// ----------------------------------------------------------------------------
// Admin/principal only. RLS-enforced client via requireSchoolAdmin. Every call
// into admin.ts receives the caller's schoolId.
//
// The POST handler is one of the two places where the class-contamination bug
// could have been introduced. admin.ts::createClass now:
//   1. Verifies academic_year_id belongs to the caller's school
//   2. Forces school_id from the caller's session on insert
// Either check alone would have prevented the Rock Foundation / Green Wood
// contamination.
//
// NOTE: listClasses is intentionally unchanged in admin.ts (Phase 5 will scope
// it). It is safe today because the RLS-enforced client is in use — RLS filters
// the rows before they reach the application. Same for getClass / deleteClass
// in the sibling [id] route.
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase } = guard;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    const result = await listClasses(supabase, { page, pageSize, search });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GET /api/admin/classes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;   // ← CHANGED: pull schoolId from guard

    const body = await request.json();

    const validatedData = classSchema.parse(body);

    // ← CHANGED: pass schoolId into createClass. admin.ts verifies the
    //   academic_year_id belongs to this school and forces school_id on insert.
    const classData = await createClass(supabase, schoolId, validatedData as any);
    return NextResponse.json(
      { data: classData, message: 'Class created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('POST /api/admin/classes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
