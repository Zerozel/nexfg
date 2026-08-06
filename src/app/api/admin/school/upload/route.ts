import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { uploadSchoolImage } from '@/lib/storage/school';

export async function POST(request: NextRequest) {
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

    const { data: school } = await supabase
      .from('schools')
      .select('slug')
      .eq('id', schoolId)
      .single();

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!['logo', 'signature'].includes(type)) {
      return NextResponse.json({ error: 'Type must be logo or signature' }, { status: 400 });
    }

    const schoolData = school as { slug: string };
    const url = await uploadSchoolImage(file, type as 'logo' | 'signature', schoolData.slug);

    const column = type === 'logo' ? 'logo_url' : 'principal_signature_url';
    const db = supabase as any;
    await db
      .from('schools')
      .update({ [column]: url, updated_at: new Date().toISOString() })
      .eq('id', schoolId);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('POST /api/admin/school/upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
