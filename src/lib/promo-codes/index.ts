import { PLAN_TERM_DAYS, PLAN_SESSION_DAYS } from "@/lib/paystack/plans";

// ════════════════════════════════════════════════════════════════════════
// Duration mapping
// ════════════════════════════════════════════════════════════════════════

export type PromoDurationUnit = "days" | "term" | "session";

export const PROMO_DURATION_OPTIONS = [
  { value: "days-7",    label: "7 days (trial extension)",   unit: "days",    days: 7 },
  { value: "days-14",   label: "14 days",                    unit: "days",    days: 14 },
  { value: "days-30",   label: "30 days (1 month)",          unit: "days",    days: 30 },
  { value: "term-1",    label: "1 term",                     unit: "term",    days: PLAN_TERM_DAYS },
  { value: "term-2",    label: "2 terms",                    unit: "term",    days: PLAN_TERM_DAYS * 2 },
  { value: "session-1", label: "1 academic session",         unit: "session", days: PLAN_SESSION_DAYS },
] as const;

export type PromoDurationOption = (typeof PROMO_DURATION_OPTIONS)[number]["value"];

export function resolveDuration(value: string): number {
  const opt = PROMO_DURATION_OPTIONS.find((o) => o.value === value);
  if (!opt) throw new Error(`Unknown duration option: ${value}`);
  return opt.days;
}

// ════════════════════════════════════════════════════════════════════════
// Tier ranking — never downgrade
// ════════════════════════════════════════════════════════════════════════

export type PromoTier = "starter" | "growth" | "premium";

const TIER_RANK: Record<string, number> = {
  free: 0,
  trial: 0,
  starter: 1,
  growth: 2,
  premium: 3,
};

export function higherTier(a: string | null, b: PromoTier): string {
  const rankA = TIER_RANK[a || "free"] ?? 0;
  const rankB = TIER_RANK[b];
  return rankB > rankA ? b : a || "free";
}

// ════════════════════════════════════════════════════════════════════════
// Code generator
// ════════════════════════════════════════════════════════════════════════

const TIER_PREFIX: Record<PromoTier, string> = {
  starter: "STR",
  growth: "GRW",
  premium: "PRM",
};

// Human-friendly alphabet: no I, L, O, 0, 1 — avoids confusing lookalikes
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without WebCrypto (shouldn't happen in Next.js)
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/**
 * Generates a promo code in the form NEXA-{PREFIX}-{8 random chars}.
 * Example: NEXA-GRW-K7M4X9P2
 */
export function generatePromoCode(targetTier: PromoTier): string {
  const prefix = TIER_PREFIX[targetTier] || "PRM";
  return `NEXA-${prefix}-${randomChars(8)}`;
}

// ════════════════════════════════════════════════════════════════════════
// Normalize + validate
// ════════════════════════════════════════════════════════════════════════

export function normalizePromoCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidPromoCodeFormat(code: string): boolean {
  return /^NEXA-[A-Z]{3}-[A-Z2-9]{8}$/.test(code);
}
