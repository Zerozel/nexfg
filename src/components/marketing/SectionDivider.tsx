interface SectionDividerProps {
  /** Small uppercase label above the headline. */
  kicker: string;
  /** Serif headline. Can include <em> for emphasis. */
  title: React.ReactNode;
  /** Optional subheading paragraph below the divider line. */
  subtitle?: string;
  /** Colors the kicker pill. Defaults to primary green. */
  tone?: "primary" | "gold" | "light";
  /** Centers the whole block. Defaults to true. */
  centered?: boolean;
}

const KICKER_TONES = {
  primary: { color: "#1a5c3a", bg: "rgba(26,92,58,0.08)" },
  gold: { color: "#c9991a", bg: "rgba(201,153,26,0.12)" },
  light: { color: "#c9991a", bg: "rgba(201,153,26,0.12)" },
};

export function SectionDivider({
  kicker,
  title,
  subtitle,
  tone = "primary",
  centered = true,
}: SectionDividerProps) {
  const kickerStyle = KICKER_TONES[tone];

  return (
    <div style={{ textAlign: centered ? "center" : "left", maxWidth: 720, margin: centered ? "0 auto" : 0 }}>
      <div
        style={{
          display: "inline-block",
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: kickerStyle.color,
          background: kickerStyle.bg,
          padding: "5px 12px",
          borderRadius: 100,
          marginBottom: 14,
        }}
      >
        {kicker}
      </div>
      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
          fontWeight: 700,
          color: "#1c1c1c",
          lineHeight: 1.15,
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: 48,
          height: 3,
          background: "#c9991a",
          borderRadius: 2,
          margin: centered ? "16px auto 24px" : "16px 0 24px",
        }}
      />
      {subtitle && (
        <p
          style={{
            fontSize: 15,
            color: "#4a4a4a",
            lineHeight: 1.75,
            maxWidth: 620,
            margin: centered ? "0 auto" : 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
