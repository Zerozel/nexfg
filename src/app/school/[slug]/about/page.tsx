import { SchoolLayout } from '@/components/public/SchoolLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getSchool(slug: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('schools').select('*').eq('slug', slug).eq('website_enabled', true).single();
  return data;
}

export default async function AboutPage({ params }: { params: { slug: string } }) {
  const school = await getSchool(params.slug);
  if (!school) notFound();
  const primaryColor = school.website_theme?.primary_color || '#2563eb';

  return (
    <SchoolLayout school={school}>
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About {school.name}</h1>
          <div className="w-16 h-1 mx-auto rounded-full mb-8" style={{ backgroundColor: primaryColor }} />
          {school.website_content?.about_text ? (
            <p className="text-gray-600 leading-relaxed text-lg">{school.website_content.about_text}</p>
          ) : (
            <p className="text-gray-500">No about information available yet.</p>
          )}
        </div>
      </section>
    </SchoolLayout>
  );
}
