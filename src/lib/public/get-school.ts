import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

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
 * Fetch a *published* (website_enabled = true) school by slug.
 * Augments the school row with aggregate stats used by the hero trust bar:
 *   - student_count
 *   - staff_count
 * These are cheap counts against existing indexes.
 */
export const getPublicSchool = cache(async (slug: string) => {
  if (!slug) return null;

  const supabase = createPublicClient();

  const { data: school } = await supabase
    .from('schools')
    .select(PUBLIC_SCHOOL_COLUMNS)
    .eq('slug', slug)
    .eq('website_enabled', true)
    .maybeSingle();

  if (!school) return null;

  const [studentCount, staffCount] = await Promise.all([
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .eq('is_deleted', false),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .in('role', ['teacher', 'admin', 'principal'])
      .eq('is_deleted', false),
  ]);

  return {
    ...school,
    student_count: studentCount.count || 0,
    staff_count: staffCount.count || 0,
  };
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
