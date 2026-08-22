import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  listAcademicYears,
  createAcademicYear,
  ensureCurrentAcademicYear,
} from '@/lib/supabase/admin';
import { academicYearSchema } from '@/lib/validations/academic-year.schema';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    // Guarantee the school always has a current session so the class form is
    // never empty. Safe to call repeatedly — it's a no-op once one exists.
    await ensureCurrentAcademicYear(supabase);

    const data = await listAcademicYears(supabase);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET /api/admin/academic-years error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    const validatedData = academicYearSchema.parse(body);

    const academicYear = await createAcademicYear(supabase, validatedData);
    return NextResponse.json(
      { data: academicYear, message: 'Academic year created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('POST /api/admin/academic-years error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
