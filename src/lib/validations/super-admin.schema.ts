import { z } from 'zod';

// Canonical tiers — must mirror SubscriptionTier in @/types/subscription.
const subscriptionTierEnum = z.enum([
  'free',
  'trial',
  'starter',
  'growth',
  'premium',
]);

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name is required'),
  admin_full_name: z.string().min(2, 'Admin full name is required'),
  admin_email: z.string().email('Invalid email address'),
  admin_password: z.string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      { message: 'Password must be at least 8 characters' }
    ),
  phone: z.string().optional(),
  subscription_tier: subscriptionTierEnum,
});

export const updateSubscriptionSchema = z.object({
  status: z.enum(['trial', 'active', 'inactive', 'expired']),
  tier: subscriptionTierEnum,
  expires_at: z.string().optional().nullable(),
});

export const suspendSchoolSchema = z.object({
  suspend: z.boolean(),
  reason: z.string().optional(),
});
