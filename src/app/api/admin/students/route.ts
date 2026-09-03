import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { listStudents, createStudent } from '@/lib/supabase/admin';
import { studentSchema } from '@/lib/validations/student.schema';
import { ZodError } from 'zod';

// Helper function to generate a unique, school-specific admission number
async function generateAdmissionNumber(
  supabase: any,
  schoolId: string,
  enrollmentYear: number
): Promise<string> {
  // Get school slug
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('slug')
    .eq('id', schoolId)
    .single();

  if (schoolError || !school) {
    console.error('Failed to fetch school slug:', schoolError);
    // Fallback: use a generic format
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SCH-${enrollmentYear}-${random}`;
  }

  const slug = school.slug.toUpperCase();
  const yearPrefix = enrollmentYear.toString();

  // Get the highest sequence number for this school and year
  const { data: existing, error: existingError } = await supabase
    .from('students')
    .select('admission_number')
    .eq('school_id', schoolId)
    .eq('enrollment_year', enrollmentYear)
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingError) {
    console.error('Failed to fetch existing admission numbers:', existingError);
    // Fallback: use random
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${slug}-${yearPrefix}-${random}`;
  }

  let sequenceNumber = 1;
  if (existing && existing.length > 0 && existing[0].admission_number) {
    const parts = existing[0].admission_number.split('-');
    if (parts.length === 3) {
      const lastNum = parseInt(parts[2], 10);
      if (!isNaN(lastNum)) {
        sequenceNumber = lastNum + 1;
      }
    }
  }

  return `${slug}-${yearPrefix}-${String(sequenceNumber).padStart(5, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    const result = await listStudents(supabase, { page, pageSize, search });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GET /api/admin/students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    // Get the current user to extract school_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    console.log('Student creation request body:', JSON.stringify(body, null, 2));

    const validatedData = studentSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Sanitize data before insertion - ensure empty strings become null
    const sanitized = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' || value === null || value === undefined ? null : value,
      ])
    );

    // ✅ FIX: Ensure enrollment_year is a number
    let enrollmentYear = sanitized.enrollment_year;
    if (typeof enrollmentYear === 'string') {
      enrollmentYear = parseInt(enrollmentYear, 10);
    }
    if (!enrollmentYear || isNaN(enrollmentYear)) {
      enrollmentYear = new Date().getFullYear();
    }

    // Generate admission_number based on school and enrollment year
    const admissionNumber = await generateAdmissionNumber(
      supabase,
      schoolId,
      enrollmentYear
    );

    sanitized.admission_number = admissionNumber;
    sanitized.school_id = schoolId;
    sanitized.enrollment_year = enrollmentYear; // Ensure it's stored as a number

    console.log('Sanitized data with admission_number:', JSON.stringify(sanitized, null, 2));

    const student = await createStudent(supabase, sanitized as any);
    return NextResponse.json(
      { data: student, message: 'Student created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
      const firstError = error.errors[0];
      return NextResponse.json({
        error: firstError.message,
        details: error.errors,
      }, { status: 400 });
    }
    console.error('POST /api/admin/students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}