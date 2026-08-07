import { SchoolLayout } from '@/components/public/SchoolLayout';
import { ContactForm } from '@/components/public/ContactForm';
import { SocialLinks } from '@/components/public/SocialLinks';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getSchool(slug: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('schools').select('*').eq('slug', slug).eq('website_enabled', true).single();
  return data;
}

export default async function ContactPage({ params }: { params: { slug: string } }) {
  const school = await getSchool(params.slug);
  if (!school) notFound();
  const primaryColor = school.website_theme?.primary_color || '#2563eb';

  return (
    <SchoolLayout school={school}>
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Contact Us</h1>
          <div className="w-16 h-1 mx-auto rounded-full mb-12" style={{ backgroundColor: primaryColor }} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {school.website_content?.contact_email && <p>✉️ {school.website_content.contact_email}</p>}
              {school.website_content?.contact_phone && <p>📞 {school.website_content.contact_phone}</p>}
              {school.website_content?.address && <p>📍 {school.website_content.address}</p>}
              <SocialLinks links={school.social_links} />
            </div>
            <ContactForm slug={params.slug} primaryColor={primaryColor} />
          </div>
        </div>
      </section>
    </SchoolLayout>
  );
}
