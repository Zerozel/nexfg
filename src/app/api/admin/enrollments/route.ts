import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  listEnrollments,
  enrollStudent,
  bulkEnrollStudents,
  bulkEnrollByAdmissionNumbers,
} from '@/lib/supabase/admin';
import { singleEnrollmentSchema, bulkEnrollmentSchema } from '@/lib/validations/enrollment.schema';
import { z } from 'zod';
import { ZodError } from 'zod';

const csvUploadSchema = z.object({
  admission_numbers: z.array(z.string()).min(1, 'At least one admission number is required'),
  class_id: z.string().uuid('Invalid class'),
  term_id: z.string().uuid('Invalid term'),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const termId = searchParams.get('termId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '10');

    if (!classId || !termId) {
      return NextResponse.json(
        { error: 'classId and termId are required' },
        { status: 400 }
      );
    }

    const result = await listEnrollments(supabase, {
      classId,
      termId,
      page,
      pageSize,
    });

    return NextResponse.json({
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.pageSize,
        total_pages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/enrollments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    // Determine if single, bulk, or CSV enrollment
    if (body.admission_numbers) {
      // CSV-style enrollment by admission numbers
      const validatedData = csvUploadSchema.parse(body);
      const result = await bulkEnrollByAdmissionNumbers(supabase, validatedData);
      return NextResponse.json(
        {
          success: true,
          enrolled: result.enrolled,
          failed: result.failed,
          errors: result.errors,
        },
        { status: 201 }
      );
    } else if (body.student_ids && Array.isArray(body.student_ids)) {
      // Bulk enrollment by student IDs
      const validatedData = bulkEnrollmentSchema.parse(body);
      const result = await bulkEnrollStudents(supabase, validatedData);
      return NextResponse.json(
        {
          success: true,
          enrolled: result.enrolled,
          failed: result.failed,
          errors: result.errors,
        },
        { status: 201 }
      );
    } else {
      // Single enrollment
      const validatedData = singleEnrollmentSchema.parse(body);
      const enrollment = await enrollStudent(supabase, validatedData);
      return NextResponse.json(
        {
          success: true,
          enrollment,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('POST /api/admin/enrollments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
