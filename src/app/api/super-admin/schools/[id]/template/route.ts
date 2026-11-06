// src/app/api/super-admin/schools/[id]/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/supabase/super-admin-auth';
import { listTemplates } from '@/lib/pdf/templates/registry';

/**
 * GET /api/super-admin/schools/[id]/template
 *
 * Returns the school's current template key plus the full list of available
 * templates (for the admin dropdown).
 */
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
      .select('id, name, report_card_template, template_updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Template GET error:', error);
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      );
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const templates = listTemplates().map((t) => ({
      key: t.key,
      name: t.name,
      description: t.description,
    }));

    return NextResponse.json({
      success: true,
      current: school.report_card_template || 'classic_nigerian',
      templates,
      updated_at: school.template_updated_at,
    });
  } catch (error: any) {
    console.error('GET /api/super-admin/schools/[id]/template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/super-admin/schools/[id]/template
 *
 * Body: { template_key: string }
 * Validates the key against the registry, updates the school, writes audit.
 */
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
    const templateKey = body?.template_key;

    if (typeof templateKey !== 'string' || !templateKey.trim()) {
      return NextResponse.json(
        { error: 'template_key is required' },
        { status: 400 }
      );
    }

    // Validate against the registry — prevents arbitrary strings.
    const validKeys = new Set(listTemplates().map((t) => t.key));
    if (!validKeys.has(templateKey)) {
      return NextResponse.json(
        {
          error: `Unknown template: ${templateKey}`,
          valid_keys: Array.from(validKeys),
        },
        { status: 400 }
      );
    }

    // Confirm the school exists and read the current value (for audit).
    const { data: existing, error: readError } = await supabase
      .from('schools')
      .select('id, report_card_template')
      .eq('id', id)
      .maybeSingle();

    if (readError) {
      console.error('Template PATCH read error:', readError);
      return NextResponse.json(
        { error: readError.message },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const previous = existing.report_card_template || 'classic_nigerian';

    if (previous === templateKey) {
      return NextResponse.json({
        success: true,
        unchanged: true,
        current: previous,
      });
    }

    // Resolve the acting super-admin's profile id for the audit trail.
    const { data: userData } = await supabase.auth.getUser();
    const actorId = userData?.user?.id ?? null;

    const { error: updateError } = await supabase
      .from('schools')
      .update({
        report_card_template: templateKey,
        template_updated_at: new Date().toISOString(),
        template_updated_by: actorId,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Template PATCH update error:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      previous,
      current: templateKey,
    });
  } catch (error: any) {
    console.error('PATCH /api/super-admin/schools/[id]/template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
