import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getTeacher, updateTeacher, deleteTeacher } from '@/lib/supabase/admin';
import { teacherSchema } from '@/lib/validations/teacher.schema';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const teacher = await getTeacher(supabase, params.id);
    return NextResponse.json({ data: teacher });
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    
    const validatedData = teacherSchema.partial().parse(body);
    
    const teacher = await updateTeacher(supabase, params.id, validatedData);
    return NextResponse.json({ data: teacher, message: 'Teacher updated successfully' });
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase();
    await deleteTeacher(supabase, params.id);
    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
