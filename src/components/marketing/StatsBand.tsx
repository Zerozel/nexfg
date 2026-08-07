import { COLORS, BAND_STATS } from "@/lib/marketing/constants";

export function StatsBand() {
  return (
    <div
      style={{
        background: COLORS.primary,
        padding: "48px 0",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 32,
          }}
        >
          {BAND_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-block-border"
              style={{
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: COLORS.white,
                  lineHeight: 1,
                }}
              >
                {stat.value}
                <span style={{ color: COLORS.gold, fontSize: "1.5rem" }}>
                  {stat.suffix}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 8,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
