import { COLORS, PHILOSOPHY_STEPS } from "@/lib/marketing/constants";

export function PhilosophySection() {
  return (
    <section
      className="section-padding"
      style={{
        background: COLORS.cream,
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
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
            Our Approach
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
            Organize. Automate. Enable.
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
            }}
          >
            We do not assume every school needs the same technology. We start
            by understanding how your school runs today — then we make it
            better, one workflow at a time.
          </p>
        </div>

        {/* Three Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 28,
            marginTop: 56,
          }}
        >
          {PHILOSOPHY_STEPS.map((step) => (
            <div
              key={step.number}
              style={{
                background: COLORS.white,
                border: "1px solid rgba(0,0,0,0.06)",
                borderTop: `3px solid ${COLORS.gold}`,
                borderRadius: 12,
                padding: "32px 28px",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: COLORS.gold,
                  marginBottom: 16,
                  lineHeight: 1,
                }}
              >
                {step.number}
              </div>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: COLORS.text,
                  marginBottom: 12,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.textMid,
                  lineHeight: 1.75,
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
