"use client";

import { useState } from "react";
import { COLORS } from "@/lib/marketing/constants";
import { SUBSCRIPTION_PLANS } from "@/lib/paystack/plans";
import type { BillingCycle } from "@/types/subscription";

interface PricingSectionProps {
  onScrollTo: (id: string) => void;
}

export function PricingSection({ onScrollTo }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("term");

  return (
    <section
      className="section-padding"
      id="pricing"
      style={{
        background: COLORS.white,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: COLORS.primary,
              background: "rgba(26,92,58,0.08)",
              padding: "5px 12px",
              borderRadius: 100,
              marginBottom: 14,
            }}
          >
            Pricing
          </div>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
              fontWeight: 700,
              color: COLORS.text,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Pay per term.
            <br />
            Or save with a session plan.
          </h2>
          <div
            style={{
              width: 48,
              height: 3,
              background: COLORS.gold,
              borderRadius: 2,
              margin: "16px auto 24px",
            }}
          />
          <p
            style={{
              fontSize: 15,
              color: COLORS.textMid,
              lineHeight: 1.75,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            NexaForge bills the way Nigerian schools think — per term, or per
            session for a discount. No charges in August. No surprises.
          </p>

          {/* Billing toggle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: 4,
              marginTop: 32,
              background: COLORS.cream,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <button
              onClick={() => setBillingCycle("term")}
              style={{
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                border: "none",
                borderRadius: 7,
                cursor: "pointer",
                background: billingCycle === "term" ? COLORS.primary : "transparent",
                color: billingCycle === "term" ? COLORS.white : COLORS.textMid,
                transition: "all 0.15s",
              }}
            >
              Pay Per Term
            </button>
            <button
              onClick={() => setBillingCycle("session")}
              style={{
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                border: "none",
                borderRadius: 7,
                cursor: "pointer",
                background: billingCycle === "session" ? COLORS.primary : "transparent",
                color: billingCycle === "session" ? COLORS.white : COLORS.textMid,
                transition: "all 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Pay Per Session
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  background: COLORS.gold,
                  color: COLORS.primaryDark,
                  padding: "2px 8px",
                  borderRadius: 100,
                  textTransform: "uppercase",
                }}
              >
                Save ~11%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            marginTop: 56,
            alignItems: "start",
          }}
        >
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const isFeatured = key === "growth";
            const isSession = billingCycle === "session" && !!plan.session_price;
            const displayed = isSession ? plan.session_price! : plan.price;
            const periodLabel = isSession ? "session" : "term";

            const fullSessionPrice = plan.price * 3;
            const discount = plan.session_price
              ? fullSessionPrice - plan.session_price
              : 0;
            const discountPercent = plan.session_price
              ? Math.round((discount / fullSessionPrice) * 100)
              : 0;

            return (
              <div
                key={key}
                className={isFeatured ? "pricing-scale" : ""}
                style={{
                  background: isFeatured ? COLORS.primary : COLORS.white,
                  border: isFeatured
                    ? `2px solid ${COLORS.gold}`
                    : "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 14,
                  padding: "32px 28px",
                  position: "relative",
                }}
              >
                {isFeatured && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: COLORS.gold,
                      color: COLORS.primaryDark,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      padding: "4px 14px",
                      borderRadius: 100,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Discount badge — session mode */}
                {isSession && discount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: isFeatured
                        ? COLORS.gold
                        : "rgba(26,92,58,0.1)",
                      color: isFeatured ? COLORS.primaryDark : COLORS.primary,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      padding: "3px 10px",
                      borderRadius: 100,
                      textTransform: "uppercase",
                    }}
                  >
                    Save ₦{discount.toLocaleString()}
                  </div>
                )}

                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    color: isFeatured
                      ? "rgba(255,255,255,0.6)"
                      : COLORS.textLight,
                  }}
                >
                  {plan.name}
                </div>

                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: isFeatured ? COLORS.white : COLORS.primary,
                    marginBottom: 4,
                  }}
                >
                  ₦{displayed.toLocaleString()}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: isFeatured
                      ? "rgba(255,255,255,0.5)"
                      : COLORS.textLight,
                    marginBottom: 4,
                  }}
                >
                  per {periodLabel} · {plan.students} students
                </div>

                {/* Session mode: show strikethrough + "covers all 3 terms" */}
                {isSession && discount > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: isFeatured
                        ? "rgba(255,255,255,0.55)"
                        : COLORS.textLight,
                      marginBottom: 20,
                    }}
                  >
                    <span style={{ textDecoration: "line-through" }}>
                      ₦{fullSessionPrice.toLocaleString()}
                    </span>{" "}
                    · Covers all 3 terms
                  </div>
                )}

                {/* Term mode: tease session discount */}
                {!isSession && plan.session_price && discount > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: isFeatured
                        ? "rgba(255,255,255,0.55)"
                        : COLORS.textLight,
                      marginBottom: 20,
                    }}
                  >
                    Or ₦{plan.session_price.toLocaleString()}/session —{" "}
                    <span
                      style={{
                        color: isFeatured ? COLORS.gold : COLORS.primary,
                        fontWeight: 600,
                      }}
                    >
                      save {discountPercent}%
                    </span>
                  </div>
                )}

                {/* Spacer when no session price shown so card heights match */}
                {!isSession && !plan.session_price && (
                  <div style={{ marginBottom: 20 }} />
                )}

                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 0",
                      fontSize: 13,
                      color: isFeatured
                        ? "rgba(255,255,255,0.75)"
                        : COLORS.textMid,
                      borderBottom: isFeatured
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <span
                      style={{
                        color: isFeatured ? COLORS.gold : COLORS.primary,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>{" "}
                    {feature}
                  </div>
                ))}

                <button
                  onClick={() => onScrollTo("cta")}
                  style={{
                    background: isFeatured ? COLORS.gold : COLORS.primary,
                    color: isFeatured ? COLORS.primaryDark : COLORS.white,
                    width: "100%",
                    marginTop: 24,
                    padding: "13px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Get Started →
                </button>
              </div>
            );
          })}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: COLORS.textLight,
            marginTop: 24,
          }}
        >
          14-day free trial on all plans. Session pricing covers all three
          terms — pay once and save up to 11%. No charges during school
          holidays.
        </p>
      </div>
    </section>
  );
}
