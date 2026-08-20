import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

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
