import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { listStudents, createStudent } from '@/lib/supabase/admin';
import { studentSchema } from '@/lib/validations/student.schema';
import { ZodError } from 'zod';

// Helper function to generate unique admission number
function generateAdmissionNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ADM-${year}-${random}`;
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
    
    // Log the incoming data for debugging
    console.log('Student creation request body:', JSON.stringify(body, null, 2));
    
    const validatedData = studentSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));
    
    // Sanitize data before insertion - ensure empty strings become null
    const sanitized = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? null : value,
      ])
    );
    
    // Generate admission_number if not provided
    if (!sanitized.admission_number) {
      sanitized.admission_number = generateAdmissionNumber();
    }
    
    console.log('Sanitized data with admission_number:', JSON.stringify(sanitized, null, 2));
    
    const student = await createStudent(supabase, sanitized as any);
    return NextResponse.json({ data: student, message: 'Student created successfully' }, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
      const firstError = error.errors[0];
      return NextResponse.json({ 
        error: firstError.message,
        details: error.errors 
      }, { status: 400 });
    }
    console.error('POST /api/admin/students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
