import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/supabase/super-admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.authorized) return guard.response;
    const supabase = guard.serviceClient;

    const { id } = await params;

    const { data: school, error } = await supabase
      .from('schools')
      .select('*, profiles!schools_admin_id_fkey(id, full_name, email, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const [
      { count: students },
      { count: teachers },
      { count: classes },
      { count: subjects },
      { count: assessments },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', id).is('is_deleted', false),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', id).in('role', ['teacher', 'admin', 'principal']).is('is_deleted', false),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', id).is('is_deleted', false),
      supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('school_id', id).is('is_deleted', false),
      supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('school_id', id).is('is_deleted', false),
    ]);

    return NextResponse.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        subdomain: school.subdomain,
        domain: school.domain,
        email: school.email,
        phone: school.phone,
        address: school.address,
        logo_url: school.logo_url,
        motto: school.motto,
        subscription_status: school.subscription_status,
        subscription_tier: school.subscription_tier,
        subscription_expires_at: school.subscription_expires_at,
        created_at: school.created_at,
        updated_at: school.updated_at,
      },
      admin: school.profiles || null,
      stats: {
        students: students || 0,
        teachers: teachers || 0,
        classes: classes || 0,
        subjects: subjects || 0,
        assessments: assessments || 0,
      },
    });
  } catch (error: any) {
    console.error('GET /api/super-admin/schools/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
