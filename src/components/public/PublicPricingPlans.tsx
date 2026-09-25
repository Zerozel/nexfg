'use client';

import { useState } from 'react';
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
export function PublicPricingPlans({
  currentTier,
  primaryColor,
}: PublicPricingPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'term' | 'session'>('term');

  return (
    <div className="space-y-8">
      {/* Billing cycle toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setBillingCycle('term')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
              billingCycle === 'term'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pay Per Term
          </button>
          <button
            onClick={() => setBillingCycle('session')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-2 ${
              billingCycle === 'session'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pay Per Session
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              Save ~11%
            </span>
          </button>
        </div>
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <PricingCard
            key={key}
            name={plan.name}
            price={plan.price}
            sessionPrice={plan.session_price}
            billingCycle={billingCycle}
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

      {/* Footnote */}
      <p className="text-xs text-center text-gray-500 max-w-2xl mx-auto">
        Session pricing covers all three terms of the current academic session
        — pay once and save up to 11% compared to term-by-term billing.
      </p>
    </div>
  );
}
