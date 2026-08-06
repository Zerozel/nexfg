import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { listTeachers, createTeacher } from '@/lib/supabase/admin';
import { teacherSchema } from '@/lib/validations/teacher.schema';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    const result = await listTeachers(supabase, { page, pageSize, search });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GET /api/admin/teachers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    
    const validatedData = teacherSchema.parse(body);
    
    const teacher = await createTeacher(supabase, validatedData);
    return NextResponse.json(
      { data: teacher, message: 'Teacher created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    if (error.message === 'Email already in use') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    console.error('POST /api/admin/teachers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
