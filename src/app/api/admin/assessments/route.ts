import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { listAssessments, createAssessment } from '@/lib/supabase/admin';
import { assessmentSchema } from '@/lib/validations/assessment.schema';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    const termId = searchParams.get('termId') || undefined;
    const type = searchParams.get('type') || undefined;

    const result = await listAssessments(supabase, {
      page,
      pageSize,
      search,
      classId,
      subjectId,
      termId,
      type,
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
    console.error('GET /api/admin/assessments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    const validatedData = assessmentSchema.parse(body);

    const sanitized = Object.fromEntries(Object.entries(validatedData).map(([k, v]) => [k, v ?? null]));
    const assessment = await createAssessment(supabase, sanitized as any);
    return NextResponse.json(
      {
        success: true,
        assessment: { id: assessment.id, name: assessment.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('POST /api/admin/assessments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
