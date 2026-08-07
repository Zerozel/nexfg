"use client";

import { COLORS, PROGRAMME_CARDS } from "@/lib/marketing/constants";

interface ProgrammesSectionProps {
  onScrollTo: (id: string) => void;
}

export function ProgrammesSection({ onScrollTo }: ProgrammesSectionProps) {
  return (
    <section
      className="section-padding"
      id="programmes"
      style={{ background: COLORS.white }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div
          className="grid-2"
          style={{ display: "grid", gap: 64, alignItems: "center" }}
        >
          {/* Left - Text */}
          <div>
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
              The Difference
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
              This is where NexaForge
              <br />
              stops being software.
            </h2>
            <div
              style={{
                width: 48,
                height: 3,
                background: COLORS.gold,
                borderRadius: 2,
                margin: "16px 0 24px",
              }}
            />
            <p
              style={{
                fontSize: 15,
                color: COLORS.textMid,
                lineHeight: 1.75,
              }}
            >
              Every school in the NexaForge network gains access to programmes
              that connect students to the real world. Not a promise. An active,
              growing calendar of opportunities your students walk into.
            </p>
            <p
              style={{
                fontSize: 15,
                color: COLORS.textMid,
                lineHeight: 1.75,
                marginTop: 16,
              }}
            >
              This is the thing no other platform in Nigeria offers. And it is
              why NexaForge schools are not just administratively better — they
              are educationally different.
            </p>
            <button
              onClick={() => onScrollTo("cta")}
              style={{
                background: COLORS.gold,
                color: COLORS.primaryDark,
                fontWeight: 700,
                fontSize: 14,
                padding: "14px 28px",
                borderRadius: 8,
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(201,153,26,0.35)",
                marginTop: 28,
              }}
            >
              Join the Network →
            </button>
          </div>

          {/* Right - Programme Cards */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 24,
              }}
            >
              {PROGRAMME_CARDS.map((card) => (
                <div
                  key={card.title}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.08)",
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 40px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      height: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 48,
                      background: card.gradient,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ padding: "20px 22px", background: COLORS.white }}>
                    <div
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "1.05rem",
                        color: COLORS.text,
                        marginBottom: 6,
                        fontWeight: 600,
                      }}
                    >
                      {card.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: COLORS.textLight,
                        lineHeight: 1.65,
                      }}
                    >
                      {card.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
