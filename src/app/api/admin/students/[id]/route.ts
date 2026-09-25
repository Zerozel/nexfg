import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  getStudent,
  updateStudent,
  deleteStudent,
  ensureStudentEnrollment,
} from '@/lib/supabase/admin';
import { studentSchema } from '@/lib/validations/student.schema';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const student = await getStudent(supabase, id);
    return NextResponse.json({ data: student });
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const body = await request.json();

    const validatedData = studentSchema.partial().parse(body);

    // Before updating, fetch the current student so we can detect a class change.
    const before = await getStudent(supabase, id);
    const previousClassId = before?.class_id || null;

    const student = await updateStudent(supabase, id, validatedData);

    const newClassId = student.class_id || null;
    const classChanged = newClassId && newClassId !== previousClassId;

    if (classChanged) {
      try {
        await ensureStudentEnrollment(supabase, student.id, newClassId);
      } catch (enrollError) {
        console.error(
          `Failed to sync enrollment for student ${student.id} on class change:`,
          enrollError
        );
      }
    }

    return NextResponse.json({ data: student, message: 'Student updated successfully' });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    await deleteStudent(supabase, id);
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
