import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { assignClassSubject } from '@/lib/supabase/admin';
import { z } from 'zod';
import { ZodError } from 'zod';

const classSubjectSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  subject_id: z.string().uuid('Invalid subject ID'),
  teacher_id: z.string().uuid('Invalid teacher ID'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    
    const validatedData = classSubjectSchema.parse(body);
    
    const assignment = await assignClassSubject(supabase, validatedData);
    return NextResponse.json(
      { data: assignment, message: 'Teacher assigned successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('POST /api/admin/class-subjects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
