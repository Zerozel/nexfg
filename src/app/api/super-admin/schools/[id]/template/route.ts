// src/app/api/super-admin/schools/[id]/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/supabase/super-admin-auth';
import { listTemplates, getTemplate } from '@/lib/pdf/templates/registry';
import { getTierLimits } from '@/lib/subscriptions/tier-limits';

const DEMO_QUOTA = 10;

/**
 * GET /api/super-admin/schools/[id]/template
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
      .select(
        'id, name, report_card_template, template_updated_at, subscription_tier, template_demo_uses'
      )
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

    const tier = (school.subscription_tier || 'free') as any;
    const demoUsed = school.template_demo_uses || 0;
    const isFree = tier === 'free';

    const templates = listTemplates().map((t) => {
      const isFreeTemplate =
        t.key === 'classic_nigerian' || t.key === 'classic_compact';
      const isCurrentlyOn = t.key === (school.report_card_template || 'classic_nigerian');

      // Allowed if: free template, OR paid tier, OR grandfathered (already on it),
      // OR still within demo quota.
      const allowed =
        isFreeTemplate ||
        !isFree ||
        isCurrentlyOn ||
        demoUsed < DEMO_QUOTA;

      return {
        key: t.key,
        name: t.name,
        description: t.description,
        is_premium: !isFreeTemplate,
        is_allowed: allowed,
      };
    });

    return NextResponse.json({
      success: true,
      current: school.report_card_template || 'classic_nigerian',
      templates,
      updated_at: school.template_updated_at,
      tier,
      demo_quota: DEMO_QUOTA,
      demo_uses_remaining: isFree ? Math.max(0, DEMO_QUOTA - demoUsed) : null,
    });
  } catch (error: any) {
    console.error('GET /api/super-admin/schools/[id]/template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/super-admin/schools/[id]/template
 *
 * Switching is allowed even at zero demo quota — the quota is consumed
 * per PDF generation, not per switch. This lets a school switch to a
 * premium template and see one preview if they still have quota.
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

    const { data: existing, error: readError } = await supabase
      .from('schools')
      .select(
        'id, report_card_template, subscription_tier, template_demo_uses'
      )
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

    const tier = (existing.subscription_tier || 'free') as any;
    const meta = getTemplate(templateKey);
    const isFreeTemplate =
      templateKey === 'classic_nigerian' || templateKey === 'classic_compact';

    // Switching is permitted regardless of demo quota. Only generation
    // (checked in the report-card routes) is gated. This lets an admin
    // switch a school to a premium template to show its structure to the
    // school owner in the modal description, but they cannot print more
    // than the demo quota.
    //
    // If you later want to enforce switching too, uncomment the block below.
    //
    // if (tier === 'free' && !isFreeTemplate && (existing.template_demo_uses || 0) >= DEMO_QUOTA) {
    //   return NextResponse.json(
    //     {
    //       error: `Demo quota exhausted. Upgrade to ${meta.name} to keep using this template.`,
    //       code: 'DEMO_QUOTA_EXHAUSTED',
    //       tier,
    //     },
    //     { status: 403 }
    //   );
    // }

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
