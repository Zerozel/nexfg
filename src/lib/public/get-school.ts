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

/**
 * Fetch a *published* (website_enabled = true) school by slug using the
 * service-role key.
 *
 * Wrapped in React `cache` so that repeated calls within a single render pass
 * (for example `generateMetadata` + the page component on the homepage) only
 * hit the database once.
 */
export const getPublicSchool = cache(async (slug: string) => {
  if (!slug) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await supabase
    .from('schools')
    .select(PUBLIC_SCHOOL_COLUMNS)
    .eq('slug', slug)
    .eq('website_enabled', true)
    .maybeSingle();

  return data;
});
