import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

/**
 * Columns that are safe to expose on the public marketing website.
 *
 * ⚠️  NEVER add admin/billing-sensitive columns here (e.g. admin_email,
 * paystack references, internal flags). This data is rendered on public,
 * unauthenticated pages and — via the public API route — can reach the browser.
 */
const PUBLIC_SCHOOL_COLUMNS =
  'id, name, slug, logo_url, motto, subscription_tier, website_enabled, website_theme, website_content, social_links';

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Fetch a *published* (website_enabled = true) school by slug. Used by every
 * public page EXCEPT the homepage, which needs to render a branded "coming
 * soon" state when the site exists but isn't published yet.
 */
export const getPublicSchool = cache(async (slug: string) => {
  if (!slug) return null;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from('schools')
    .select(PUBLIC_SCHOOL_COLUMNS)
    .eq('slug', slug)
    .eq('website_enabled', true)
    .maybeSingle();

  return data;
});

/**
 * Fetch a school by slug regardless of publication state. Used ONLY by the
 * homepage to distinguish "site doesn't exist" from "site exists but isn't
 * published yet".
 */
export const getSchoolForHomepage = cache(async (slug: string) => {
  if (!slug) return null;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from('schools')
    .select(PUBLIC_SCHOOL_COLUMNS)
    .eq('slug', slug)
    .maybeSingle();

  return data;
});
