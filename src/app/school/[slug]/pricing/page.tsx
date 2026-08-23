import { SchoolLayout } from '@/components/public/SchoolLayout';
import { PublicPricingPlans } from '@/components/public/PublicPricingPlans';
import { getPublicSchool } from '@/lib/public/get-school';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function PricingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getPublicSchool(slug);
  if (!school) notFound();

  const primaryColor = school.website_theme?.primary_color || '#2563eb';
  const currentTier = school.subscription_tier || 'free';

  return (
    <SchoolLayout school={school}>
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-500 mb-12">Select the plan that fits your school&apos;s needs</p>

          <PublicPricingPlans currentTier={currentTier} primaryColor={primaryColor} />

          <p className="text-sm text-gray-400 mt-8">💳 Secured by Paystack</p>
        </div>
      </section>
    </SchoolLayout>
  );
}
