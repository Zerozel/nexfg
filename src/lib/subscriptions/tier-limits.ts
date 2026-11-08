// src/lib/subscriptions/tier-limits.ts
import type {
  SubscriptionTier,
  SubscriptionStatusValue,
} from "@/types/subscription";

/**
 * Per-tier feature limits.
 * `Infinity` means unlimited within that tier.
 */
export interface TierLimits {
  studentCap: number;
  staffCap: number;
  allowedTemplates: string[] | "all";
  ocrQuotaPerTerm: number;
  customDomain: boolean;
  removeWatermark: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    studentCap: 50,
    staffCap: 10,
    allowedTemplates: ["classic_nigerian"],
    ocrQuotaPerTerm: 0,
    customDomain: false,
    removeWatermark: false,
  },
  trial: {
    studentCap: 100,
    staffCap: 20,
    allowedTemplates: ["classic_nigerian", "classic_compact"],
    ocrQuotaPerTerm: 5,
    customDomain: false,
    removeWatermark: false,
  },
  starter: {
    studentCap: 300,
    staffCap: 50,
    allowedTemplates: [
      "classic_nigerian",
      "classic_compact",
      "heritage_navy",
    ],
    ocrQuotaPerTerm: 20,
    customDomain: false,
    removeWatermark: true,
  },
  growth: {
    studentCap: Infinity,
    staffCap: Infinity,
    allowedTemplates: "all",
    ocrQuotaPerTerm: 200,
    customDomain: false,
    removeWatermark: true,
  },
  premium: {
    studentCap: Infinity,
    staffCap: Infinity,
    allowedTemplates: "all",
    ocrQuotaPerTerm: Infinity,
    customDomain: true,
    removeWatermark: true,
  },
};

export function getTierLimits(
  tier: SubscriptionTier | null | undefined
): TierLimits {
  if (!tier) return TIER_LIMITS.free;
  return TIER_LIMITS[tier] ?? TIER_LIMITS.free;
}

export function isTemplateAllowed(
  tier: SubscriptionTier | null | undefined,
  templateKey: string
): boolean {
  const limits = getTierLimits(tier);
  if (limits.allowedTemplates === "all") return true;
  return limits.allowedTemplates.includes(templateKey);
}

export function isStudentCapReached(
  tier: SubscriptionTier | null | undefined,
  currentCount: number
): boolean {
  return currentCount >= getTierLimits(tier).studentCap;
}

/**
 * An account is "writable" only while its subscription is trial or active.
 * Free tier is always writable (subject to its caps).
 * Inactive/expired accounts cannot create new records.
 */
export function isAccountWritable(
  status: SubscriptionStatusValue | null | undefined
): boolean {
  if (!status) return false;
  return status === "trial" || status === "active";
}

/**
 * Human-friendly label for the cap, used in error messages.
 */
export function formatCap(cap: number): string {
  return cap === Infinity ? "unlimited" : String(cap);
}
