// Canonical subscription enums — the single source of truth used across the
// app (billing UI, super-admin management, API validation). `free` and `trial`
// are lifecycle tiers; `starter`/`growth`/`premium` are the purchasable plans.
export type SubscriptionTier =
  | 'free'
  | 'trial'
  | 'starter'
  | 'growth'
  | 'premium';

export type SubscriptionStatusValue =
  | 'trial'
  | 'active'
  | 'expired'
  | 'inactive';

export interface SubscriptionPlan {
  name: string;
  price: number;
  period: string;
  students: string;
  staff: string;
  features: string[];
  paystackPlanCode?: string;
}

export interface SubscriptionStatus {
  status: SubscriptionStatusValue;
  tier: SubscriptionTier;
  expires_at: string | null;
  usage: { students: number; staff: number };
  limits: { students: number; staff: number };
}

export interface PaymentHistoryEntry {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  plan: string;
  created_at: string;
}
