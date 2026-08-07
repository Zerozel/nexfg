import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSchoolSchema } from '@/lib/validations/super-admin.schema';
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

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
      .select('*, profiles!schools_admin_id_fkey(full_name, email)', { count: 'exact' })
      .is('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,subdomain.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('subscription_status', status);
    }
    if (tier) {
      query = query.eq('subscription_tier', tier);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const schools = (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      subdomain: s.subdomain,
      domain: s.domain,
      admin_name: s.profiles?.full_name || 'N/A',
      admin_email: s.profiles?.email || 'N/A',
      subscription_status: s.subscription_status,
      subscription_tier: s.subscription_tier,
      student_count: 0,
      teacher_count: 0,
      class_count: 0,
      created_at: s.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: schools,
      meta: { total: count || 0, page, limit, total_pages: Math.ceil((count || 0) / limit) },
    });
  } catch (error: any) {
    console.error('GET /api/super-admin/schools error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await request.json();
    const validatedData = createSchoolSchema.parse(body);

    const slug = generateSlug(validatedData.name);
    const subdomain = `${slug}.nexaforges.me`;
    const password = validatedData.admin_password || generatePassword();

    // Create school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: validatedData.name,
        slug,
        subdomain,
        email: validatedData.admin_email,
        phone: validatedData.phone || null,
        subscription_status: validatedData.subscription_tier === 'trial' ? 'trial' : 'active',
        subscription_tier: validatedData.subscription_tier,
        subscription_expires_at: validatedData.subscription_tier === 'trial'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })
      .select()
      .single();

    if (schoolError) throw schoolError;

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.admin_email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: validatedData.admin_full_name,
        role: 'admin',
        school_id: school.id,
      },
    });

    if (authError) {
      // Rollback school creation
      await supabase.from('schools').delete().eq('id', school.id);
      if (authError.message?.includes('already been registered')) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
      throw authError;
    }

    // Create profile
    await supabase.from('profiles').insert({
      id: authUser.user.id,
      school_id: school.id,
      full_name: validatedData.admin_full_name,
      email: validatedData.admin_email,
      role: 'admin',
    });

    // Update school with admin_id
    await supabase.from('schools').update({ admin_id: authUser.user.id }).eq('id', school.id);

    return NextResponse.json({
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
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('POST /api/super-admin/schools error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
