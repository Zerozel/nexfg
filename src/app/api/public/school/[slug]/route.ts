import { NextRequest, NextResponse } from 'next/server';
import { getPublicSchool } from '@/lib/public/get-school';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // getPublicSchool uses the service-role key and selects ONLY public,
    // whitelisted columns — so no admin/billing fields leak to the browser.
    const school = await getPublicSchool(slug);

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, school });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
