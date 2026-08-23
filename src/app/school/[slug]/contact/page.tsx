import { SchoolLayout } from '@/components/public/SchoolLayout';
import { ContactForm } from '@/components/public/ContactForm';
import { SocialLinks } from '@/components/public/SocialLinks';
import { getPublicSchool } from '@/lib/public/get-school';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function ContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
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
            <ContactForm slug={slug} primaryColor={primaryColor} />
          </div>
        </div>
      </section>
    </SchoolLayout>
  );
}
