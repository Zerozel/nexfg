import { SubscriptionPlan } from '@/types/subscription';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    name: 'Starter',
    price: 15000,
    period: 'term',
    students: '200',
    staff: '10',
    features: [
      'Up to 200 students',
      'Up to 10 staff',
      'School website',
      'Email support',
      'Score entry & compilation',
      'Report card generation',
    ],
  },
  growth: {
    name: 'Growth',
    price: 30000,
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
    price: 60000,
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
  starter: { students: 200, staff: 10 },
  growth: { students: 500, staff: 30 },
  premium: { students: Infinity, staff: Infinity },
  free: { students: 50, staff: 5 },
  trial: { students: 100, staff: 10 },
};
