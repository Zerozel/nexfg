import { SubscriptionPlan } from '@/types/subscription';

// A Nigerian school term runs ~4 months. Per-term subscription extends access
// by this many days.
export const PLAN_TERM_DAYS = 120;

// A full academic session = 3 terms. Per-session subscription extends access
// by this many days. Slightly under 3×120 to allow for transitions.
export const PLAN_SESSION_DAYS = 350;

export type BillingCycle = 'term' | 'session';

// Plans that can actually be purchased through Paystack checkout.
export const PURCHASABLE_PLANS = ['starter', 'growth', 'premium'] as const;

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    name: 'Starter',
    price: 15000,             // per term
    session_price: 40000,     // per session (~11% discount vs 3× term)
    period: 'term',
    students: '150',
    staff: '10',
    features: [
      'Up to 150 students',
      'Up to 10 staff',
      'School website',
      'Email support',
      'Score entry & compilation',
      'Report card generation',
    ],
  },
  growth: {
    name: 'Growth',
    price: 35000,
    session_price: 95000,
    period: 'term',
    students: '500',
    staff: '30',
    features: [
      'Up to 500 students',
      'Up to 30 staff',
      'School website',
      'Priority support',
      'NexaForge Program access',
      'Advanced analytics',
    ],
  },
  premium: {
    name: 'Premium',
    price: 63000,
    session_price: 170000,
    period: 'term',
    students: 'Unlimited',
    staff: 'Unlimited',
    features: [
      'Unlimited students',
      'Unlimited staff',
      'Custom domain',
      'Dedicated support',
      'Full ecosystem access',
      'White-label reports',
    ],
  },
};

export const PLAN_LIMITS: Record<string, { students: number; staff: number }> = {
  starter: { students: 150, staff: 10 },
  growth: { students: 500, staff: 30 },
  premium: { students: Infinity, staff: Infinity },
  free: { students: 50, staff: 5 },
  trial: { students: 100, staff: 10 },
};

/** Amount charged for a given plan + billing cycle (in NGN, not kobo). */
export function priceFor(planKey: string, cycle: BillingCycle): number {
  const plan = SUBSCRIPTION_PLANS[planKey];
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);
  if (cycle === 'session') {
    return plan.session_price ?? plan.price * 3;
  }
  return plan.price;
}

/** Days added to the subscription for a given billing cycle. */
export function daysFor(cycle: BillingCycle): number {
  return cycle === 'session' ? PLAN_SESSION_DAYS : PLAN_TERM_DAYS;
}
