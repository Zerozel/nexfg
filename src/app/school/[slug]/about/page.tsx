import { SchoolLayout } from '@/components/public/SchoolLayout';
import { getPublicSchool } from '@/lib/public/get-school';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const DEFAULT_MISSION =
  'To empower students with knowledge, skills, and character to excel in a dynamic world.';
const DEFAULT_VISION =
  'To be a center of educational excellence and innovation, nurturing future leaders.';

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
  if (!school) notFound();
  const primaryColor = school.website_theme?.primary_color || '#2563eb';
  const content = school.website_content || {};

  return (
    <SchoolLayout school={school}>
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About {school.name}</h1>
          <div className="w-16 h-1 mx-auto rounded-full mb-8" style={{ backgroundColor: primaryColor }} />
          {content.about_text ? (
            <p className="text-gray-600 leading-relaxed text-lg">{content.about_text}</p>
          ) : (
            <p className="text-gray-500">No about information available yet.</p>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-gray-200 shadow-sm" style={{ borderTopColor: primaryColor, borderTopWidth: '4px' }}>
            <h2 className="font-bold text-lg mb-3" style={{ color: '#1A1A2E' }}>Our Mission</h2>
            <p className="text-gray-600">{content.mission || DEFAULT_MISSION}</p>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 shadow-sm" style={{ borderTopColor: primaryColor, borderTopWidth: '4px' }}>
            <h2 className="font-bold text-lg mb-3" style={{ color: '#1A1A2E' }}>Our Vision</h2>
            <p className="text-gray-600">{content.vision || DEFAULT_VISION}</p>
          </div>
        </div>
      </section>
    </SchoolLayout>
  );
}
