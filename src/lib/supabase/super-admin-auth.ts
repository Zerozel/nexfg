// src/lib/supabase/super-admin-auth.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type SuperAdminGuardResult =
  | { authorized: true; serviceClient: SupabaseClient; userId: string }
  | { authorized: false; response: NextResponse };

/**
 * Authorization guard for Super Admin API routes.
 *
 * Validates the caller's session (JWT verified against Supabase Auth) and
 * confirms the `super_admin` role from `app_metadata`. On success it returns a
 * service-role client so the route can perform privileged operations.
 *
 * All Super Admin routes use the service-role key (which bypasses RLS), so this
 * guard is the only thing protecting them — never skip it.
 */
export async function requireSuperAdmin(): Promise<SuperAdminGuardResult> {
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
  if (role !== 'super_admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden. Super admin access required.' },
        { status: 403 }
      ),
    };
  }

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  return { authorized: true, serviceClient, userId: user.id };
}
