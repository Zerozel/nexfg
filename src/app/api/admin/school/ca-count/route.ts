// src/app/api/admin/school/ca-count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { reconcileAssessmentsForSchool } from '@/lib/supabase/admin';

/**
 * PATCH /api/admin/school/ca-count
 * body: { ca_count: 2 | 3 }
 *
 * Changes the school's CA count and re-provisions all existing
 * assessments for every class+subject pair.
 *
 * Admin/principal only. School-scoped.
 *
 * Lives under /school (not /school-settings) to sit beside the main
 * school-update route at /api/admin/school/route.ts.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    if (!['admin', 'principal'].includes(role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school associated' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const caCount = Number(body?.ca_count);

    if (caCount !== 2 && caCount !== 3) {
      return NextResponse.json(
        { error: 'ca_count must be 2 or 3' },
        { status: 400 }
      );
    }

    const db = supabase as any;

    // 1. Update the school's ca_count
    const { error: updateError } = await db
      .from('schools')
      .update({ ca_count: caCount, updated_at: new Date().toISOString() })
      .eq('id', schoolId);

    if (updateError) throw updateError;

    // 2. Reconcile all existing assessments
    const result = await reconcileAssessmentsForSchool(
      supabase,
      schoolId,
      caCount as 2 | 3
    );

    return NextResponse.json({
      success: true,
      data: {
        ca_count: caCount,
        classes_processed: result.classes_processed,
        subjects_processed: result.subjects_processed,
        errors: result.errors,
      },
      message:
        caCount === 2
          ? 'Switched to 2 continuous assessments. All scores preserved.'
          : 'Switched to 3 continuous assessments. CA3 column restored.',
    });
  } catch (error: any) {
    console.error('PATCH /api/admin/school/ca-count error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update CA count' },
      { status: 500 }
    );
  }
}
