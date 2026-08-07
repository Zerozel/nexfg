"use client";

import { COLORS, PRICING_PLANS } from "@/lib/marketing/constants";

interface PricingSectionProps {
  onScrollTo: (id: string) => void;
}

export function PricingSection({ onScrollTo }: PricingSectionProps) {
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
            Not per month.
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
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            NexaForge bills the way Nigerian schools think — per term and per
            session. No charges in August. No surprises.
          </p>
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
          {PRICING_PLANS.map((plan) => {
            const isFeatured = plan.featured;

            return (
              <div
                key={plan.name}
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
                {plan.badge && (
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
                    {plan.badge}
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
                  {plan.price}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: isFeatured
                      ? "rgba(255,255,255,0.5)"
                      : COLORS.textLight,
                    marginBottom: 20,
                  }}
                >
                  {plan.period}
                </div>

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
          14-day free trial on all plans. Pay per session and save one
          term&apos;s cost. No charges during school holidays.
        </p>
      </div>
    </section>
  );
}
