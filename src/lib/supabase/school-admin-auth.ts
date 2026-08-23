// src/lib/supabase/school-admin-auth.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export type SchoolAdminGuardResult =
  | {
      authorized: true;
      supabase: SupabaseClient;
      user: User;
      schoolId: string;
    }
  | { authorized: false; response: NextResponse };

// Roles permitted to manage a school's billing/subscription.
const BILLING_ROLES = ['admin', 'principal'];

/**
 * Authorization guard for school-scoped subscription/billing API routes.
 *
 * Validates the caller's session (JWT verified against Supabase Auth), confirms
 * an admin/principal role, and ensures a `school_id` is present in
 * `app_metadata`. Returns the request-scoped (RLS-enforced) client plus the
 * resolved school context so routes don't have to re-derive it.
 *
 * Teachers and users without a school context are rejected — billing must never
 * be initiated by an unauthorized or school-less user.
 */
export async function requireSchoolAdmin(): Promise<SchoolAdminGuardResult> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const role = user.app_metadata?.role;
  if (!role || !BILLING_ROLES.includes(role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      ),
    };
  }

  const schoolId = user.app_metadata?.school_id as string | undefined;
  if (!schoolId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'No school context found for this account.' },
        { status: 400 }
      ),
    };
  }

  return { authorized: true, supabase, user, schoolId };
}
