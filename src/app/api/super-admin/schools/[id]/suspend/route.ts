import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/supabase/super-admin-auth';
import { suspendSchoolSchema } from '@/lib/validations/super-admin.schema';
import { ZodError } from 'zod';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.authorized) return guard.response;
    const supabase = guard.serviceClient;

    const { id } = await params;
    const body = await request.json();
    const validatedData = suspendSchoolSchema.parse(body);

    // Get current tier to restore an appropriate status when unsuspending
    const { data: school } = await supabase
      .from('schools')
      .select('subscription_status, subscription_tier')
      .eq('id', id)
      .single();

    const newStatus = validatedData.suspend
      ? 'inactive'
      : (school?.subscription_tier === 'trial' ? 'trial' : 'active');

    const { error } = await supabase
      .from('schools')
      .update({
        subscription_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: validatedData.suspend ? 'School suspended successfully' : 'School unsuspended successfully',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('PUT /api/super-admin/schools/[id]/suspend error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
