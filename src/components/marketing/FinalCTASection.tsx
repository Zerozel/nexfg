import { COLORS, TRUST_BADGES } from "@/lib/marketing/constants";

export function FinalCTASection() {
  return (
    <section
      className="section-padding"
      id="cta"
      style={{
        background: `linear-gradient(160deg, ${COLORS.primaryDeep} 0%, ${COLORS.primaryDark} 50%, #1a5c3a 100%)`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(201,153,26,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
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
          Get Started
        </div>

        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2rem, 8vw, 3.2rem)",
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.15,
            maxWidth: 700,
            margin: "0 auto 20px",
          }}
        >
          Your School&apos;s Transformation
          <br />
          <em style={{ color: COLORS.gold, fontStyle: "italic" }}>
            Starts Today.
          </em>
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
            color: "rgba(255,255,255,0.68)",
            fontSize: 16,
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.8,
          }}
        >
          Join the schools across Nigeria that are running smarter, looking
          professional, and producing students that the world is actually
          waiting for.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          <a
            href="mailto:admin@nexaforges.me?subject=Get%20my%20school%20on%20NexaForge&body=School%20name%3A%0ALocation%3A%0AApprox.%20number%20of%20students%3A%0AContact%20phone%3A%0A%0AWe%27d%20like%20to%20get%20started%20on%20NexaForge."
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
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Get Your School on NexaForge →
          </a>
          <a
            href="tel:+2348012345678"
            style={{
              background: "transparent",
              color: COLORS.white,
              fontWeight: 600,
              fontSize: 14,
              padding: "13px 28px",
              borderRadius: 8,
              cursor: "pointer",
              border: "2px solid rgba(255,255,255,0.3)",
              fontFamily: "inherit",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Schedule a Demo Call
          </a>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
              }}
            >
              <span style={{ color: COLORS.gold }}>✓</span> {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
