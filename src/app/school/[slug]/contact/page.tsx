import { SchoolLayout } from '@/components/public/SchoolLayout';
import { ContactForm } from '@/components/public/ContactForm';
import { SocialLinks } from '@/components/public/SocialLinks';
import { getPublicSchool } from '@/lib/public/get-school';
import { notFound } from 'next/navigation';
import { Mail, Phone, MapPin } from 'lucide-react';
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
  return {
    title: `Contact — ${school.name}`,
    description:
      school.website_content?.address ||
      school.motto ||
      `Get in touch with ${school.name}.`,
    openGraph: {
      title: `Contact — ${school.name}`,
      description: school.motto || '',
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
  if (!school) notFound();
  const primaryColor = school.website_theme?.primary_color || '#2563eb';

  return (
    <SchoolLayout school={school}>
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Contact Us
          </h1>
          <div
            className="w-16 h-1 mx-auto rounded-full mb-12"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {school.website_content?.contact_email && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Mail
                      className="h-5 w-5"
                      style={{ color: primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a
                      href={`mailto:${school.website_content.contact_email}`}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {school.website_content.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {school.website_content?.contact_phone && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Phone
                      className="h-5 w-5"
                      style={{ color: primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a
                      href={`tel:${school.website_content.contact_phone}`}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {school.website_content.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {school.website_content?.address && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <MapPin
                      className="h-5 w-5"
                      style={{ color: primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Address
                    </p>
                    <p className="text-sm text-gray-600">
                      {school.website_content.address}
                    </p>
                  </div>
                </div>
              )}

              {school.social_links &&
                (school.social_links.facebook ||
                  school.social_links.twitter ||
                  school.social_links.instagram) && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      Follow Us
                    </p>
                    <SocialLinks links={school.social_links} />
                  </div>
                )}
            </div>

            <ContactForm slug={slug} primaryColor={primaryColor} />
          </div>
        </div>
      </section>
    </SchoolLayout>
  );
}
