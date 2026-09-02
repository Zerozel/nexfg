import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { schoolSettingsSchema } from '@/lib/validations/school.schema';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, school });
  } catch (error: any) {
    console.error('GET /api/admin/school error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = schoolSettingsSchema.parse(body);

    // Cast the Supabase client as any to bypass TypeScript's strict type checking
    // for dynamic update fields from the Zod schema
    const db = supabase as any;
    const { error } = await db
      .from('schools')
      .update({ ...validatedData, updated_at: new Date().toISOString() })
      .eq('id', schoolId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'School settings updated successfully',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('PUT /api/admin/school error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
