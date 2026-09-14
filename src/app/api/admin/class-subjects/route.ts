// src/app/api/admin/class-subjects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { assignClassSubject } from '@/lib/supabase/admin';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { z } from 'zod';
import { ZodError } from 'zod';

// ============================================================================
// ARCHITECTURAL NOTES
// ----------------------------------------------------------------------------
// Admin/principal only. Every call into admin.ts receives schoolId.
// assignClassSubject now provisions class+term-scoped assessments as a
// side-effect, so this route is one of the two "front doors" that makes the
// compile pipeline work.
// ============================================================================

const classSubjectSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  subject_id: z.string().uuid('Invalid subject ID'),
  teacher_id: z.string().uuid('Invalid teacher ID'),
});

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const body = await request.json();

    const validatedData = classSubjectSchema.parse(body);

    const assignment = await assignClassSubject(supabase, schoolId, validatedData);
    return NextResponse.json(
      { data: assignment, message: 'Teacher assigned successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('POST /api/admin/class-subjects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
