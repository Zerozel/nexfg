import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/supabase/super-admin-auth';
import { updateSubscriptionSchema } from '@/lib/validations/super-admin.schema';
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
    const validatedData = updateSubscriptionSchema.parse(body);

    const { error } = await supabase
      .from('schools')
      .update({
        subscription_status: validatedData.status,
        subscription_tier: validatedData.tier,
        subscription_expires_at: validatedData.expires_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('PUT /api/super-admin/schools/[id]/status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
