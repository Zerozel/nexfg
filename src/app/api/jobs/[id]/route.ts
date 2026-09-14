// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// ============================================================================
// ARCHITECTURAL NOTES
// ----------------------------------------------------------------------------
// Polling endpoint consumed by src/hooks/useCompileJob.ts.
//
// Response contract (FLAT, not wrapped in { data: ... }):
//   { id, status, progress, error_message? }
//
// Auth mirrors POST /api/admin/compile/route.ts:
//   - admin, principal, super_admin are allowed
//   - any other role → 403
//   - unauthenticated → 401
//
// Tenant scoping:
//   - admin / principal: read is filtered to their own school_id
//   - super_admin:       no school filter (matches RLS which allows
//                        super_admin cross-tenant visibility)
//
// 404 behavior:
//   - Job not found → 404
//   - Job exists but belongs to another school (non-super-admin) → same 404,
//     so we do not leak existence of another tenant's job by id.
//
// TYPE DEBT NOTE:
//   src/types/supabase.ts is currently a placeholder (Tables: Record<string,
//   unknown>), so Supabase cannot infer row shapes. We declare the row type
//   locally to keep this route type-safe. When the generated types are
//   installed (see "Supabase type regeneration" task), this local type and
//   the cast below can be removed.
// ============================================================================

type CompilationJobRow = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number | null;
  error_message: string | null;
  school_id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createServerSupabase();

    // ── Auth: mirror the compile POST route ────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = user.app_metadata?.role;
    const allowedRoles = ['admin', 'principal', 'super_admin'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isSuperAdmin = role === 'super_admin';

    const schoolId: string | null =
      (user.app_metadata?.school_id as string | undefined) ?? null;

    if (!isSuperAdmin && !schoolId) {
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    // ── Query: fetch by id. School filtering happens in code because
    //    conditionally chaining .eq() trips Supabase's type inference when the
    //    Database type is a placeholder (see TYPE DEBT NOTE above).
    const { data: jobRaw, error: jobError } = await supabase
      .from('compilation_jobs')
      .select('id, status, progress, error_message, school_id')
      .eq('id', id)
      .maybeSingle();

    if (jobError) {
      console.error('Error fetching compilation job:', jobError);
      return NextResponse.json(
        { error: 'Failed to fetch job status' },
        { status: 500 }
      );
    }

    // Cast through unknown because the generated Database type is a
    // placeholder. Safe: the SELECT above lists exactly these columns.
    const job = jobRaw as unknown as CompilationJobRow | null;

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Tenant check (non-super-admin only). Return the same 404 as "not found"
    // so we never leak existence of another school's job.
    if (!isSuperAdmin && job.school_id !== schoolId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // ── Response: FLAT shape matching useCompileJob.ts contract exactly
    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress ?? 0,
      ...(job.error_message ? { error_message: job.error_message } : {}),
    });
  } catch (error: any) {
    console.error('GET /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
