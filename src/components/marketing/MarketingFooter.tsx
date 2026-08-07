import { COLORS, FOOTER_COLUMNS } from "@/lib/marketing/constants";

export function MarketingFooter() {
  return (
    <footer
      style={{
        background: COLORS.primaryDeep,
        padding: "64px 0 0",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {/* Footer Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48,
            paddingBottom: 48,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Brand Column */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #c9991a 0%, #f0c840 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Georgia, serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLORS.primaryDark,
                  flexShrink: 0,
                  boxShadow: "0 2px 12px rgba(201,153,26,0.4)",
                }}
              >
                N
              </div>
              <div style={{ color: COLORS.white }}>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.1,
                  }}
                >
                  NexaForge
                </div>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 2,
                  }}
                >
                  By TheNexaVerse
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.75,
                maxWidth: 280,
              }}
            >
              Forging Africa&apos;s Future — one school at a time. The education
              ecosystem for the African school that refuses to produce students
              who are only good at passing exams.
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                📧 admin@nexaforges.me
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                📞 08012345678
              </span>
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: COLORS.gold,
                  fontWeight: 600,
                  marginBottom: 18,
                }}
              >
                {column.heading}
              </div>
              {column.links.map((link) => (
                <button
                  key={link}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    padding: "4px 0",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  {link}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            padding: "20px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            © 2026 NexaForge. All rights reserved. A TheNexaVerse Enterprise.
          </p>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Forging Africa&apos;s Future{" "}
            <span
              style={{
                color: COLORS.gold,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              NEXAFORGE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
