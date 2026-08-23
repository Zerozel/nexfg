import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createMiddlewareSupabase } from '@/lib/supabase/middleware-client';
import type { UserRole } from '@/types';

// Next.js 16: the `middleware` convention is deprecated and renamed to `proxy`
// (now runs on the Node.js runtime). See docs/02-guides/upgrading/version-16.

const BASE_DOMAIN = 'nexaforges.me';

/**
 * Resolve a school slug from a *custom domain* (e.g. `myschool.com`).
 *
 * Only called for genuine custom domains (never for the platform apex or its
 * subdomains), so this DB read does not run on normal platform traffic.
 * For very high traffic, cache this lookup (e.g. Edge Config / Redis).
 */
async function getSlugByCustomDomain(domain: string): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await supabase
      .from('schools')
      .select('slug')
      .eq('domain', domain)
      .eq('website_enabled', true)
      .maybeSingle();
    return data?.slug ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const path = req.nextUrl.pathname;

  // ============================================================
  // Public website routing (subdomain + custom domain -> /school/{slug})
  // ============================================================
  // Only "content" paths are eligible. Crucially we skip paths that already
  // start with `/school/` so an internal link like `/school/{slug}/about`
  // isn't rewritten again into `/school/{slug}/school/{slug}/about` (BUG-2).
  const isRewriteEligible =
    !path.startsWith('/api/') &&
    !path.startsWith('/_next/') &&
    !path.startsWith('/school/') &&
    !path.startsWith('/dashboard') &&
    !path.startsWith('/login') &&
    !path.startsWith('/super-admin') &&
    !path.startsWith('/payment') &&
    !path.includes('.');

  if (isRewriteEligible) {
    if (host.endsWith(`.${BASE_DOMAIN}`)) {
      // Subdomain: {slug}.nexaforges.me
      const slug = host.split('.')[0];
      if (slug && slug !== 'www') {
        return NextResponse.rewrite(new URL(`/school/${slug}${path}`, req.url));
      }
    } else if (
      host &&
      host !== BASE_DOMAIN &&
      host !== `www.${BASE_DOMAIN}` &&
      host !== 'localhost'
    ) {
      // Custom domain: myschool.com -> resolve slug from DB
      const slug = await getSlugByCustomDomain(host);
      if (slug) {
        return NextResponse.rewrite(new URL(`/school/${slug}${path}`, req.url));
      }
    }
  }

  // ============================================================
  // Auth protection — ONLY for the dashboard + auth pages.
  // Public routes (marketing, /school/*, /payment, custom domains) must never
  // be redirected to /login, and shouldn't pay for an auth round-trip (BUG-3).
  // ============================================================
  const isAuthPage = path === '/login' || path === '/super-admin/login';
  const isProtectedRoute = path.startsWith('/dashboard');

  if (!isAuthPage && !isProtectedRoute) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareSupabase(req, res);

  // SECURE: Validate JWT with Supabase Auth server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // No valid user: allow auth pages only
  if (userError || !user) {
    if (isAuthPage) return res;
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = user.app_metadata?.role as UserRole;

  if (isAuthPage) {
    if (role === 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard/super-admin', req.url));
    }
    const dashboardPath =
      role === 'teacher' ? '/dashboard/teacher' : '/dashboard/admin';
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  if (path.startsWith('/dashboard/teacher') && role !== 'teacher') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (
    path.startsWith('/dashboard/admin') &&
    !['admin', 'principal'].includes(role)
  ) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (path.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/super-admin/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/login',
    '/super-admin/login',
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
