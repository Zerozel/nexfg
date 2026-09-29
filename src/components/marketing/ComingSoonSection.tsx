import { COLORS, COMING_SOON_ITEMS } from "@/lib/marketing/constants";

export function ComingSoonSection() {
  return (
    <section
      className="section-padding"
      id="coming-soon"
      style={{ background: COLORS.white }}
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
            In Development
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
            What we are building next.
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
            We do not sell features before they exist. These are the
            capabilities we are actively working on — and we will announce each
            one to our schools as it becomes available.
          </p>
        </div>

        {/* Coming Soon Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 56,
          }}
        >
          {COMING_SOON_ITEMS.map((item) => (
            <div
              key={item.title}
              style={{
                background: COLORS.cream,
                border: "1px dashed rgba(26,92,58,0.3)",
                borderRadius: 12,
                padding: "28px 24px",
                position: "relative",
              }}
            >
              {/* "Coming soon" pill */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: COLORS.goldLight,
                  color: COLORS.primary,
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 100,
                  fontWeight: 600,
                }}
              >
                Coming Soon
              </div>

              <div style={{ fontSize: 32, marginBottom: 16, marginTop: 8 }}>
                {item.icon}
              </div>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1.1rem",
                  color: COLORS.text,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.textMid,
                  lineHeight: 1.7,
                  marginBottom: 12,
                }}
              >
                {item.description}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.primary,
                  fontStyle: "italic",
                  paddingTop: 12,
                  borderTop: "1px solid rgba(26,92,58,0.1)",
                }}
              >
                {item.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
