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
  status: 'trial' | 'active' | 'expired' | 'inactive';
  tier: 'free' | 'starter' | 'growth' | 'premium';
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
