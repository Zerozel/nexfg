import { SchoolLayout } from '@/components/public/SchoolLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { GallerySection } from '@/components/public/GallerySection';
import { ContactSection } from '@/components/public/ContactSection';
import { getPublicSchool } from '@/lib/public/get-school';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
  if (!school) return { title: 'School Not Found' };
  return {
    title: school.name,
    description: school.website_content?.hero_subtitle || school.motto || '',
    openGraph: { title: school.name, description: school.motto || '' },
  };
}

export default async function SchoolHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
  if (!school) notFound();

  const primaryColor = school.website_theme?.primary_color || '#2563eb';

  return (
    <SchoolLayout school={school}>
      <HeroSection
        title={school.website_content?.hero_title || `Welcome to ${school.name}`}
        subtitle={school.website_content?.hero_subtitle || null}
        motto={school.motto}
        primaryColor={primaryColor}
        slug={slug}
      />
      <AboutSection
        aboutText={school.website_content?.about_text || null}
        mission={school.website_content?.mission || null}
        vision={school.website_content?.vision || null}
        primaryColor={primaryColor}
        slug={slug}
      />
      <GallerySection gallery={school.website_content?.gallery || []} primaryColor={primaryColor} slug={slug} />
      <ContactSection
        slug={slug}
        primaryColor={primaryColor}
        contactEmail={school.website_content?.contact_email || null}
        contactPhone={school.website_content?.contact_phone || null}
        address={school.website_content?.address || null}
        socialLinks={school.social_links}
      />
    </SchoolLayout>
  );
}
