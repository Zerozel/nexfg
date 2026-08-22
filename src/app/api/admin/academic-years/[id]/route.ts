import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  getAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from '@/lib/supabase/admin';
import { academicYearUpdateSchema } from '@/lib/validations/academic-year.schema';

import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const academicYear = await getAcademicYear(supabase, id);
    return NextResponse.json({ data: academicYear });
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

    const validatedData = academicYearUpdateSchema.parse(body);


    const academicYear = await updateAcademicYear(supabase, id, validatedData);
    return NextResponse.json({
      data: academicYear,
      message: 'Academic year updated successfully',
    });
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
    await deleteAcademicYear(supabase, id);
    return NextResponse.json({ message: 'Academic year deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
