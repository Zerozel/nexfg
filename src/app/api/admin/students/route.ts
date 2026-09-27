import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  listStudents,
  createStudent,
  ensureStudentEnrollment,
} from '@/lib/supabase/admin';
import { studentSchema } from '@/lib/validations/student.schema';
import { ZodError } from 'zod';

// ============================================================================
// generateAdmissionNumber
// ----------------------------------------------------------------------------
// Produces admission numbers of the form:
//   <SLUG>/<YEAR>/<PREFIX><SERIAL>
// where:
//   SLUG    — school slug, uppercased
//   YEAR    — 4-digit enrollment year
//   PREFIX  — the class's code_prefix column (e.g. 10A for JSS1A)
//   SERIAL  — per-class-per-year sequence, starting at 01
//
// Examples:
//   ROCK/2026/10A01  — first student in JSS1A in 2026
//   ROCK/2026/10A02  — second student
//   ROCK/2026/10B01  — first student in JSS1B
//   ROCK/2026/UN01   — student with no class assigned yet
// ============================================================================
async function generateAdmissionNumber(
  supabase: any,
  schoolId: string,
  enrollmentYear: number,
  classId: string | null
): Promise<string> {
  // 1. School slug
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('slug')
    .eq('id', schoolId)
    .single();

  if (schoolError || !school) {
    console.error('Failed to fetch school slug:', schoolError);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SCH/${enrollmentYear}/XX${random}`;
  }

  const slug = (school.slug as string).toUpperCase();

  // 2. Unassigned students get a shared UN prefix
  if (!classId) {
    const { count, error: countError } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('enrollment_year', enrollmentYear)
      .is('class_id', null)
      .eq('is_deleted', false);

    if (countError) throw countError;

    const serial = String((count || 0) + 1).padStart(2, '0');
    return `${slug}/${enrollmentYear}/UN${serial}`;
  }

  // 3. Resolve the class's code_prefix
  const { data: cls, error: classError } = await supabase
    .from('classes')
    .select('code_prefix, name')
    .eq('id', classId)
    .eq('school_id', schoolId)
    .maybeSingle();

  if (classError) throw classError;

  const prefix = (cls?.code_prefix as string) || 'UN';

  // 4. Count existing students in the same class + year to get the next serial
  const { count, error: countError } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('enrollment_year', enrollmentYear)
    .eq('is_deleted', false);

  if (countError) throw countError;

  const serial = String((count || 0) + 1).padStart(2, '0');

  return `${slug}/${enrollmentYear}/${prefix}${serial}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school associated' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get('grouped') === '1';

    // ─── Grouped response for the paid-tier student view ───
    if (grouped) {
      const { data: classes, error: classesError } = (await supabase
        .from('classes')
        .select('id, name, base_name, display_order')
        .eq('school_id', schoolId)
        .is('is_deleted', false)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })) as unknown as {
        data: any[] | null;
        error: unknown;
      };

      if (classesError) throw classesError;

      const { data: students, error: studentsError } = (await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_deleted', false)
        .order('full_name', { ascending: true })) as unknown as {
        data: any[] | null;
        error: unknown;
      };

      if (studentsError) throw studentsError;

      const bucket = new Map<string, any[]>();
      const unassigned: any[] = [];

      for (const s of students || []) {
        if (!s.class_id) {
          unassigned.push(s);
          continue;
        }
        if (!bucket.has(s.class_id)) bucket.set(s.class_id, []);
        bucket.get(s.class_id)!.push(s);
      }

      const groups: any[] = [];

      for (const c of classes || []) {
        const list = bucket.get(c.id) || [];
        groups.push({
          class_id: c.id,
          class_name: c.name,
          base_name: c.base_name || null,
          display_order: c.display_order ?? null,
          students: list,
        });
      }

      if (unassigned.length > 0) {
        groups.push({
          class_id: null,
          class_name: 'Unassigned',
          base_name: null,
          display_order: 999999,
          students: unassigned,
        });
      }

      return NextResponse.json({
        success: true,
        groups,
        total: (students || []).length,
      });
    }

    // ─── Flat paginated response (existing behavior) ───
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school associated' },
        { status: 403 }
      );
    }

    const validatedData = studentSchema.parse(body);

    const sanitized = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' || value === null || value === undefined ? null : value,
      ])
    );

    let enrollmentYear = sanitized.enrollment_year;
    if (typeof enrollmentYear === 'string') {
      enrollmentYear = parseInt(enrollmentYear, 10);
    }
    if (!enrollmentYear || isNaN(enrollmentYear)) {
      enrollmentYear = new Date().getFullYear();
    }

    const admissionNumber = await generateAdmissionNumber(
      supabase,
      schoolId,
      enrollmentYear,
      (sanitized.class_id as string) || null
    );

    sanitized.admission_number = admissionNumber;
    sanitized.school_id = schoolId;
    sanitized.enrollment_year = enrollmentYear;

    const student = await createStudent(supabase, sanitized as any);

    // Sync the enrollments table so report cards / class sheets / batch print
    // can find this student. `students.class_id` alone is not enough.
    if (student.class_id) {
      try {
        await ensureStudentEnrollment(supabase, student.id, student.class_id);
      } catch (enrollError) {
        console.error(
          `Failed to create enrollment for student ${student.id}:`,
          enrollError
        );
      }
    }

    return NextResponse.json(
      { data: student, message: 'Student created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error(
        'Zod validation errors:',
        JSON.stringify(error.errors, null, 2)
      );
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          error: firstError.message,
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error('POST /api/admin/students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
