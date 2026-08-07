import { COLORS, PROBLEM_STATS } from "@/lib/marketing/constants";

export function ProblemSection() {
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
        <div className="grid-2" style={{ display: "grid", gap: 48, alignItems: "center" }}>
          {/* Left */}
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
              The Reality
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
              Nigerian education has been producing job-seekers for 60 years.
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
              Children study hard, pass exams, collect certificates — and walk
              into a world that has moved on without them. They were prepared for
              a world of stable employment that barely exists anymore.
            </p>
            <p
              style={{
                fontSize: 15,
                color: COLORS.textMid,
                lineHeight: 1.75,
                marginTop: 16,
              }}
            >
              The problem is not the teachers. It is not even the schools. It is
              that the tools and programmes schools need to do something
              different have never been put within reach — until now.
            </p>
          </div>

          {/* Right */}
          <div className="mobile-pad-0" style={{ padding: "0 16px" }}>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "1.6rem",
                fontStyle: "italic",
                color: COLORS.primary,
                lineHeight: 1.5,
                borderLeft: `4px solid ${COLORS.gold}`,
                paddingLeft: 24,
                marginBottom: 24,
              }}
            >
              "The certificate is not the ceiling. But nobody told the school."
            </p>
            {PROBLEM_STATS.map((stat) => (
              <div
                key={stat.value}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <div style={{ fontSize: 24, flexShrink: 0 }}>{stat.icon}</div>
                <div>
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: COLORS.textMid,
                      lineHeight: 1.55,
                    }}
                  >
                    {stat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
