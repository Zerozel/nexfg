import { COLORS, ECOSYSTEM_CARDS } from "@/lib/marketing/constants";

export function EcosystemSection() {
  return (
    <section
      className="section-padding"
      style={{
        background: COLORS.cream,
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
            The Ecosystem
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
            Four ways NexaForge
            <br />
            creates value for African education.
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
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 56,
          }}
        >
          {ECOSYSTEM_CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                background: COLORS.white,
                border: "1px solid rgba(0,0,0,0.08)",
                borderTop: `3px solid ${card.borderColor || COLORS.primary}`,
                borderRadius: 12,
                padding: "28px 24px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{card.icon}</div>
              {card.subLabel && (
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: 2,
                    color: card.borderColor || COLORS.primary,
                    marginBottom: 6,
                  }}
                >
                  {card.subLabel}
                </div>
              )}
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1.1rem",
                  color: card.borderColor || COLORS.text,
                  marginBottom: 8,
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
          ))}
        </div>
      </div>
    </section>
  );
}
