import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware-client";
import type { UserRole } from "@/types";

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const path = req.nextUrl.pathname;
   //this is chaotic
  // ============================================================
  // PHASE 6.5: Subdomain → /school/{slug} rewrite (skip API/static)
  // ============================================================
  if (
    !path.startsWith('/api/') &&
    !path.startsWith('/_next/') &&
    !path.includes('.')
  ) {
    if (host.endsWith('.nexaforges.me') || host.endsWith('.nexaforges.me:3000')) {
      const slug = host.split('.')[0];
      if (slug && slug !== 'www') {
        return NextResponse.rewrite(new URL(`/school/${slug}${path}`, req.url));
      }
    }
  }

  // ============================================================
  // EXISTING: Auth protection
  // ============================================================
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabase(req, res);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage =
    path === "/login" || path === "/super-admin/login";
  const isProtectedRoute = path.startsWith("/dashboard");

  if (!session) {
    if (isAuthPage) return res;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.app_metadata?.role as UserRole;

  if (isAuthPage) {
    if (role === "super_admin") {
      return NextResponse.redirect(
        new URL("/dashboard/super-admin", req.url)
      );
    }
    const dashboardPath =
      role === "teacher"
        ? "/dashboard/teacher"
        : "/dashboard/admin";
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  if (path.startsWith("/dashboard/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    path.startsWith("/dashboard/admin") &&
    !["admin", "principal"].includes(role)
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    path.startsWith("/dashboard/super-admin") &&
    role !== "super_admin"
  ) {
    return NextResponse.redirect(
      new URL("/super-admin/login", req.url)
    );
  }

  return res;
}

export const config = {
  matcher: [
    "/login",
    "/super-admin/login",
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
