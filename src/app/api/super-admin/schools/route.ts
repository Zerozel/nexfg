// src/app/api/super-admin/schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/supabase/super-admin-auth';
import { createSchoolSchema } from '@/lib/validations/super-admin.schema';
import { generateSessionName } from '@/lib/supabase/admin';
import { ZodError } from 'zod';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.authorized) return guard.response;
    const supabase = guard.serviceClient;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const tier = searchParams.get('tier') || '';
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('schools')
      .select(
        'id, name, slug, subdomain, domain, email, phone, address, city, state, country, subscription_status, subscription_tier, subscription_expires_at, created_at, admin_id, principal_id',
        { count: 'exact' }
      )
      .is('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,subdomain.ilike.%${search}%`);
    }
    if (status) query = query.eq('subscription_status', status);
    if (tier) query = query.eq('subscription_tier', tier);

    const { data, error, count } = await query;
    if (error) throw error;

    // Fetch all referenced profile ids in one query
    const profileIds = new Set<string>();
    (data || []).forEach((s: any) => {
      if (s.admin_id) profileIds.add(s.admin_id);
      if (s.principal_id) profileIds.add(s.principal_id);
    });

    const profileMap = new Map<
      string,
      { full_name: string; role: string | null }
    >();

    if (profileIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', Array.from(profileIds));

      (profiles || []).forEach((p: any) => {
        profileMap.set(p.id, { full_name: p.full_name, role: p.role });
      });
    }

    const schools = (data || []).map((s: any) => {
      const admin = s.admin_id ? profileMap.get(s.admin_id) : null;
      const principal = s.principal_id ? profileMap.get(s.principal_id) : null;

      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        subdomain: s.subdomain,
        domain: s.domain,
        email: s.email,
        phone: s.phone,
        city: s.city,
        state: s.state,
        country: s.country,
        admin_name: admin?.full_name || null,
        admin_email: null,
        principal_name: principal?.full_name || null,
        principal_email: null,
        // For list display: prefer principal (highest authority)
        leadership_name: principal?.full_name || admin?.full_name || 'N/A',
        leadership_role: principal ? 'Principal' : admin ? 'Administrator' : null,
        subscription_status: s.subscription_status,
        subscription_tier: s.subscription_tier,
        subscription_expires_at: s.subscription_expires_at,
        created_at: s.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: schools,
      meta: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('GET /api/super-admin/schools error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireSuperAdmin();
    if (!guard.authorized) return guard.response;
    const supabase = guard.serviceClient;

    const body = await request.json();
    const validatedData = createSchoolSchema.parse(body);

    const slug = generateSlug(validatedData.name);
    const subdomain = `${slug}.nexaforges.me`;
    const password = validatedData.admin_password || generatePassword();

    // Create school with identity fields
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: validatedData.name,
        slug,
        subdomain,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || 'Nigeria',
        subscription_status:
          validatedData.subscription_tier === 'trial' ? 'trial' : 'active',
        subscription_tier: validatedData.subscription_tier,
        subscription_expires_at:
          validatedData.subscription_tier === 'trial'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
      })
      .select()
      .single();

    if (schoolError) throw schoolError;

    // Create the admin auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: validatedData.admin_email,
        password,
        email_confirm: true,
        user_metadata: { full_name: validatedData.admin_full_name },
        app_metadata: { role: 'admin', school_id: school.id },
      });

    if (authError) {
      await supabase.from('schools').delete().eq('id', school.id);
      if (authError.message?.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
      throw authError;
    }

    // Create the admin profile
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authUser.user.id,
        school_id: school.id,
        full_name: validatedData.admin_full_name,
        role: 'admin',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('schools').delete().eq('id', school.id);
      throw profileError;
    }

    // Link admin to school
    await supabase
      .from('schools')
      .update({ admin_id: authUser.user.id })
      .eq('id', school.id);

    // Seed the initial academic session
    const { error: sessionError } = await supabase
      .from('academic_years')
      .insert({
        school_id: school.id,
        name: generateSessionName(),
        is_current: true,
      });

    if (sessionError) {
      console.error(
        'Failed to seed initial academic year (non-fatal):',
        sessionError
      );
    } else {
      const { data: newYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('school_id', school.id)
        .eq('is_current', true)
        .single();

      if (newYear) {
        const { error: termsError } = await supabase.from('terms').insert([
          {
            school_id: school.id,
            academic_year_id: newYear.id,
            name: 'First Term',
            is_current: true,
            order: 1,
          },
          {
            school_id: school.id,
            academic_year_id: newYear.id,
            name: 'Second Term',
            is_current: false,
            order: 2,
          },
          {
            school_id: school.id,
            academic_year_id: newYear.id,
            name: 'Third Term',
            is_current: false,
            order: 3,
          },
        ]);
        if (termsError) {
          console.error(
            'Failed to create terms (non-fatal - trigger may have handled it):',
            termsError
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        school: {
          id: school.id,
          name: school.name,
          subdomain: school.subdomain,
          slug: school.slug,
        },
        admin: {
          id: authUser.user.id,
          full_name: validatedData.admin_full_name,
          email: validatedData.admin_email,
          temporary_password: password,
        },
        login_url: 'https://nexaforges.me/login',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('POST /api/super-admin/schools error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
