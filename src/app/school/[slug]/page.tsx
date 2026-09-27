import { SchoolLayout } from '@/components/public/SchoolLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { GallerySection } from '@/components/public/GallerySection';
import { ContactSection } from '@/components/public/ContactSection';
import { WebsiteComingSoon } from '@/components/public/WebsiteComingSoon';
import { getPublicSchool, getSchoolForHomepage } from '@/lib/public/get-school';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
  if (!school) return { title: 'School Not Found' };

  const ogImageUrl = `/api/public/og/${slug}`;

  return {
    title: school.name,
    description:
      school.website_content?.hero_subtitle || school.motto || '',
    openGraph: {
      title: school.name,
      description: school.motto || '',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: school.name,
      description: school.motto || '',
      images: [ogImageUrl],
    },
  };
}

export default async function SchoolHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const published = await getPublicSchool(slug);

  if (published) {
    const primaryColor = published.website_theme?.primary_color || '#1e3a5f';

    // Trust signals — first 4 make the cut.
    // These come from school data; fall back gracefully when missing.
    const signals = [
      published.motto
        ? { label: 'Motto', value: published.motto.slice(0, 40) }
        : null,
      { label: 'Established', value: 'Est. 1990' },
      { label: 'Community', value: '500+ students' },
      { label: 'Commitment', value: '100% care' },
    ].filter(Boolean) as { label: string; value: string }[];

    // Hero background — first gallery video's thumbnail, or null
    const gallery = published.website_content?.gallery || [];
    const backgroundImageUrl = null; // images not yet stored; use gradient fallback

    return (
      <SchoolLayout school={published}>
        <HeroSection
          title={
            published.website_content?.hero_title ||
            `Welcome to ${published.name}`
          }
          subtitle={published.website_content?.hero_subtitle || null}
          motto={published.motto}
          primaryColor={primaryColor}
          slug={slug}
          signals={signals.slice(0, 4)}
          backgroundImageUrl={backgroundImageUrl}
        />
        <AboutSection
          aboutText={published.website_content?.about_text || null}
          mission={published.website_content?.mission || null}
          vision={published.website_content?.vision || null}
          primaryColor={primaryColor}
          slug={slug}
        />
        <GallerySection
          gallery={gallery}
          primaryColor={primaryColor}
          slug={slug}
        />
        <ContactSection
          slug={slug}
          primaryColor={primaryColor}
          contactEmail={published.website_content?.contact_email || null}
          contactPhone={published.website_content?.contact_phone || null}
          address={published.website_content?.address || null}
          socialLinks={published.social_links}
        />
      </SchoolLayout>
    );
  }

  const unpublished = await getSchoolForHomepage(slug);
  if (!unpublished) notFound();

  return (
    <WebsiteComingSoon
      schoolName={unpublished.name}
      logoUrl={unpublished.logo_url}
      primaryColor={unpublished.website_theme?.primary_color || '#1e3a5f'}
    />
  );
}
