import { SchoolLayout } from '@/components/public/SchoolLayout';
import { GalleryGrid } from '@/components/public/GalleryGrid';
import { getPublicSchool } from '@/lib/public/get-school';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
  if (!school) notFound();
  const primaryColor = school.website_theme?.primary_color || '#2563eb';

  return (
    <SchoolLayout school={school}>
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Gallery</h1>
          <div className="w-16 h-1 mx-auto rounded-full mb-12" style={{ backgroundColor: primaryColor }} />
          <GalleryGrid gallery={school.website_content?.gallery || []} />
        </div>
      </section>
    </SchoolLayout>
  );
}
