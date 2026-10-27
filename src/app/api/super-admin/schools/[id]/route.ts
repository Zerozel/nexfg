// src/app/api/super-admin/schools/[id]/route.ts
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
      .select(
        'id, name, slug, subdomain, domain, email, phone, address, city, state, country, logo_url, motto, subscription_status, subscription_tier, subscription_expires_at, created_at, updated_at, admin_id, principal_id'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('School lookup error:', error);
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      );
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const profileIds = [school.admin_id, school.principal_id].filter(
      Boolean
    ) as string[];

    const profileMap = new Map<
      string,
      { id: string; full_name: string; avatar_url: string | null }
    >();

    if (profileIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', profileIds);

      (profiles || []).forEach((p: any) => {
        profileMap.set(p.id, {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url ?? null,
        });
      });
    }

    const admin = school.admin_id
      ? profileMap.get(school.admin_id) || null
      : null;
    const principal = school.principal_id
      ? profileMap.get(school.principal_id) || null
      : null;

    const [
      { count: students },
      { count: teachers },
      { count: classes },
      { count: subjects },
      { count: assessments },
    ] = await Promise.all([
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', id)
        .is('is_deleted', false),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', id)
        .in('role', ['teacher', 'admin', 'principal'])
        .is('is_deleted', false),
      supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', id)
        .is('is_deleted', false),
      supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', id)
        .is('is_deleted', false),
      supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', id)
        .is('is_deleted', false),
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
        city: school.city,
        state: school.state,
        country: school.country,
        logo_url: school.logo_url,
        motto: school.motto,
        subscription_status: school.subscription_status,
        subscription_tier: school.subscription_tier,
        subscription_expires_at: school.subscription_expires_at,
        created_at: school.created_at,
        updated_at: school.updated_at,
      },
      principal,
      admin,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.authorized) return guard.response;
    const supabase = guard.serviceClient;

    const { id } = await params;
    const body = await request.json();

    // Whitelist editable fields. Anything else is silently dropped so the
    // route can't be abused to change admin_id, principal_id, subscription
    // fields, or is_deleted.
    const allowed = [
      'name',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'country',
    ] as const;

    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        patch[key] = body[key] === '' ? null : body[key];
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: 'No editable fields provided' },
        { status: 400 }
      );
    }

    // If name changed, regenerate slug + subdomain. Note this changes the
    // school's public URL — warn the caller in the UI before they save.
    if (patch.name) {
      const newSlug = String(patch.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      patch.slug = newSlug;
      patch.subdomain = `${newSlug}.nexaforges.me`;
    }

    patch.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('schools')
      .update(patch)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/super-admin/schools/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
