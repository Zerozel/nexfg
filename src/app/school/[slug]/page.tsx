import { SchoolLayout } from '@/components/public/SchoolLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { WhySection } from '@/components/public/WhySection';
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

    const signals: { label: string; value: string }[] = [];

    if (published.student_count > 0) {
      signals.push({
        label: 'Students',
        value: `${published.student_count}+`,
      });
    }
    if (published.staff_count > 0) {
      signals.push({
        label: 'Educators',
        value: `${published.staff_count}`,
      });
    }
    if (published.motto) {
      signals.push({
        label: 'Our Promise',
        value: published.motto.slice(0, 24),
      });
    }
    if (signals.length < 3) {
      signals.push({ label: 'Committed to', value: 'Excellence' });
    }

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
          backgroundImageUrl={null}
        />
        <AboutSection
          aboutText={published.website_content?.about_text || null}
          mission={published.website_content?.mission || null}
          vision={published.website_content?.vision || null}
          primaryColor={primaryColor}
          slug={slug}
        />
        <WhySection
          schoolName={published.name}
          primaryColor={primaryColor}
          highlights={published.website_content?.highlights || null}
        />
        <GallerySection
          gallery={published.website_content?.gallery || []}
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
