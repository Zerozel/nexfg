import { PricingCard } from '@/components/subscription/PricingCard';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack/plans';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getSchool(slug: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('schools').select('*').eq('slug', slug).single();
  return data;
}

export default async function PricingPage({ params }: { params: { slug: string } }) {
  const school = await getSchool(params.slug);
  if (!school) notFound();

  const primaryColor = school.website_theme?.primary_color || '#2563eb';
  const currentTier = school.subscription_tier || 'free';

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-500 mb-12">Select the plan that fits your school's needs</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <PricingCard
              key={key}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              students={plan.students}
              staff={plan.staff}
              features={plan.features}
              isCurrent={currentTier === key}
              primaryColor={primaryColor}
              onSubscribe={() => {}}
            />
          ))}
        </div>

        <p className="text-sm text-gray-400 mt-8">💳 Secured by Paystack</p>
      </div>
    </div>
  );
}
