import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super_admin
    const role = user.app_metadata?.role;
    if (!['admin', 'principal', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { class_id, term_id } = body;

    if (!class_id || !term_id) {
      return NextResponse.json(
        { error: 'class_id and term_id are required' },
        { status: 400 }
      );
    }

    // ✅ FIX: Use 'as any' to bypass type inference
    const { data: job, error: jobError } = await supabase
      .from('compilation_jobs')
      .insert({
        school_id: user.app_metadata?.school_id,
        class_id,
        term_id,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (jobError) {
      console.error('Error creating compilation job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create compilation job' },
        { status: 500 }
      );
    }

    // ✅ FIX: Cast job to any to access properties
    const jobData = job as any;

    return NextResponse.json({
      success: true,
      job_id: jobData.id,
      status: jobData.status,
    });
  } catch (error: any) {
    console.error('Compilation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
