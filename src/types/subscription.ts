// Canonical subscription enums — the single source of truth used across the
// app (billing UI, super-admin management, API validation).

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

export type BillingCycle = 'term' | 'session';

export interface SubscriptionPlan {
  name: string;
  /** Price per term (NGN). */
  price: number;
  /** Price per academic session (NGN). Optional — falls back to 3× price. */
  session_price?: number;
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
  /** 'term' or 'session' — the cycle of the most recent successful payment. */
  billing_cycle: BillingCycle | null;
  /** Number of days until expiry (negative if already expired). */
  days_until_expiry: number | null;
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
  billing_cycle: BillingCycle | null;
  created_at: string;
}
