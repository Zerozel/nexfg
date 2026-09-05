import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
  listAcademicYears,
  createAcademicYear,
  ensureCurrentAcademicYear,
} from '@/lib/supabase/admin';
import { academicYearSchema } from '@/lib/validations/academic-year.schema';
import { ZodError } from 'zod';

// Create a service role client that bypasses RLS
function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function GET() {
  try {
    console.log('🔍 GET /api/admin/academic-years - Started');
    
    // Use service client for read operations to bypass RLS
    const supabase = getServiceClient();
    console.log('✅ Service client created');

    // Get the current user to extract school_id
    const userClient = await createServerSupabase();
    const { data: { user } } = await userClient.auth.getUser();
    
    if (!user) {
      console.log('❌ No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    console.log('👤 User school_id:', schoolId);
    
    if (!schoolId) {
      console.log('❌ No school_id in app_metadata');
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    // Ensure the school has a current academic year
    console.log('📅 Ensuring current academic year...');
    await ensureCurrentAcademicYear(supabase);
    console.log('✅ Academic year ensured');

    const data = await listAcademicYears(supabase);
    console.log('📊 Academic years found:', data.length);
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('❌ GET /api/admin/academic-years error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/admin/academic-years - Started');
    
    const body = await request.json();
    console.log('📦 Request body:', body);
    
    const validatedData = academicYearSchema.parse(body);
    console.log('✅ Validated data:', validatedData);

    // Use service client to bypass RLS
    const supabase = getServiceClient();
    console.log('✅ Service client created');

    // Get the current user to extract school_id
    const userClient = await createServerSupabase();
    const { data: { user } } = await userClient.auth.getUser();
    
    if (!user) {
      console.log('❌ No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    console.log('👤 User school_id:', schoolId);
    
    if (!schoolId) {
      console.log('❌ No school_id in app_metadata');
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    // Ensure school_id is set in the data (handled by RLS in the function)
    console.log('📅 Creating academic year...');
    const academicYear = await createAcademicYear(supabase, validatedData);
    console.log('✅ Academic year created:', academicYear);
    
    return NextResponse.json(
      { data: academicYear, message: 'Academic year created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      console.error('❌ Zod validation error:', firstError.message);
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }
    console.error('❌ POST /api/admin/academic-years error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
