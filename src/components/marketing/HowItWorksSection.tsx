import { COLORS, STEPS } from "@/lib/marketing/constants";

export function HowItWorksSection() {
  return (
    <section
      className="section-padding"
      style={{
        background: `linear-gradient(160deg, ${COLORS.primaryDeep} 0%, ${COLORS.primaryDark} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,255,255,0.015) 60px,rgba(255,255,255,0.015) 61px)",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: COLORS.gold,
              background: "rgba(201,153,26,0.12)",
              padding: "5px 12px",
              borderRadius: 100,
              marginBottom: 14,
            }}
          >
            Simple Process
          </div>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            From signup to fully operational
            <br />
            in under 24 hours.
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

        {/* Steps Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 28,
            marginTop: 56,
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "32px 28px",
                position: "relative",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.gold}, #f0c840)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Georgia, serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: COLORS.primaryDark,
                  marginBottom: 20,
                }}
              >
                {step.number}
              </div>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1.15rem",
                  color: COLORS.white,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13.5,
                  lineHeight: 1.7,
                }}
              >
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
