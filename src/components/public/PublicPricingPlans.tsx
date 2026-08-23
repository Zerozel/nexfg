'use client';

import { PricingCard } from '@/components/subscription/PricingCard';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack/plans';

interface PublicPricingPlansProps {
  currentTier: string;
  primaryColor: string;
}

/**
 * Client wrapper for the public pricing grid.
 *
 * `PricingCard` is a Client Component and requires an `onSubscribe` function.
 * Functions cannot be passed from a Server Component across the client
 * boundary, so the interactive grid lives here.
 */
export function PublicPricingPlans({ currentTier, primaryColor }: PublicPricingPlansProps) {
  return (
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
          onSubscribe={() => {
            // Billing is managed from the authenticated admin dashboard; the
            // route's AuthGuard redirects unauthenticated visitors to /login.
            window.location.href = '/dashboard/admin/billing';
          }}
        />
      ))}
    </div>
  );
}
