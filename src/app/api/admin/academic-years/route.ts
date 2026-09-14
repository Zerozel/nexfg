// src/app/api/admin/academic-years/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  listAcademicYears,
  createAcademicYear,
  ensureCurrentAcademicYear,
} from '@/lib/supabase/admin';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { academicYearSchema } from '@/lib/validations/academic-year.schema';
import { ZodError } from 'zod';

// ============================================================================
// ARCHITECTURAL NOTES
// ----------------------------------------------------------------------------
// This route is admin/principal only. It uses the RLS-enforced client
// (createServerSupabase, via requireSchoolAdmin) — NOT the service role key.
// Tenant isolation is enforced at two layers:
//   1. RLS policies on academic_years
//   2. Explicit .eq('school_id', schoolId) inside src/lib/supabase/admin.ts
//
// Every call into admin.ts passes the caller's schoolId. Do NOT add a
// service-role client to this file — the previous version did, and that is
// exactly how a cross-tenant academic_year_id ended up on Rock Foundation's
// classes.
// ============================================================================

export async function GET() {
  try {
    console.log('🔍 GET /api/admin/academic-years - Started');

    // ← CHANGED: use the shared admin guard. Returns { supabase, user, schoolId }
    //   or a 401/403 NextResponse. Removes the local school_id extraction that
    //   was previously done and then discarded.
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    console.log('👤 User school_id:', schoolId);

    // ← CHANGED: pass schoolId into every admin.ts call.
    //   Previously: ensureCurrentAcademicYear(supabase)  → could return ANY school's year
    //   Now:        ensureCurrentAcademicYear(supabase, schoolId)
    console.log('📅 Ensuring current academic year...');
    await ensureCurrentAcademicYear(supabase, schoolId);
    console.log('✅ Academic year ensured');

    // ← CHANGED: pass schoolId so the list is scoped to this school only.
    const data = await listAcademicYears(supabase, schoolId);
    console.log('📊 Academic years found:', data.length);

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('❌ GET /api/admin/academic-years error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/admin/academic-years - Started');

    const body = await request.json();
    console.log('📦 Request body:', body);

    const validatedData = academicYearSchema.parse(body);
    console.log('✅ Validated data:', validatedData);

    // ← CHANGED: same guard pattern as GET.
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    console.log('👤 User school_id:', schoolId);

    // ← CHANGED: pass schoolId into createAcademicYear. admin.ts now writes it
    //   into the new row explicitly. Previously this insert would fail on the
    //   NOT NULL constraint (or silently land with the wrong school via RLS on a
    //   permissive policy). The stale comment "(handled by RLS in the function)"
    //   was wrong and has been removed.
    console.log('📅 Creating academic year...');
    const academicYear = await createAcademicYear(supabase, schoolId, validatedData);
    console.log('✅ Academic year created:', academicYear);

    return NextResponse.json(
      { data: academicYear, message: 'Academic year created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      console.error('❌ Zod validation error:', firstError.message);
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('❌ POST /api/admin/academic-years error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
