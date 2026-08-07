import { SchoolLayout } from '@/components/public/SchoolLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { GallerySection } from '@/components/public/GallerySection';
import { ContactSection } from '@/components/public/ContactSection';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getSchool(slug: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('schools').select('*').eq('slug', slug).eq('website_enabled', true).single();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const school = await getSchool(params.slug);
  if (!school) return { title: 'School Not Found' };
  return {
    title: school.name,
    description: school.website_content?.hero_subtitle || school.motto || '',
    openGraph: { title: school.name, description: school.motto || '' },
  };
}

export default async function SchoolHomePage({ params }: { params: { slug: string } }) {
  const school = await getSchool(params.slug);
  if (!school) notFound();

  const primaryColor = school.website_theme?.primary_color || '#2563eb';

  return (
    <SchoolLayout school={school}>
      <HeroSection
        title={school.website_content?.hero_title || `Welcome to ${school.name}`}
        subtitle={school.website_content?.hero_subtitle || null}
        motto={school.motto}
        primaryColor={primaryColor}
        slug={params.slug}
      />
      <AboutSection aboutText={school.website_content?.about_text || null} primaryColor={primaryColor} slug={params.slug} />
      <GallerySection gallery={school.website_content?.gallery || []} primaryColor={primaryColor} slug={params.slug} />
      <ContactSection
        slug={params.slug}
        primaryColor={primaryColor}
        contactEmail={school.website_content?.contact_email || null}
        contactPhone={school.website_content?.contact_phone || null}
        address={school.website_content?.address || null}
        socialLinks={school.social_links}
      />
    </SchoolLayout>
  );
}
