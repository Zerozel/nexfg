import type { LucideIcon } from "lucide-react";
import { Monitor, Target, TabletSmartphone, Landmark } from "lucide-react";
import { COLORS, ECOSYSTEM_CARDS } from "@/lib/marketing/constants";
import { IconBadge } from "./IconBadge";
import { SectionDivider } from "./SectionDivider";

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor,
  Target,
  TabletSmartphone,
  Landmark,
};

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
        <SectionDivider
          kicker="The NexaForge Vision"
          title="Four areas, one direction."
          subtitle="The platform is available today. The other three areas describe where we are heading — clearly labelled so you always know what exists and what is planned."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 56,
          }}
        >
          {ECOSYSTEM_CARDS.map((card) => {
            const Icon = ICON_MAP[card.icon];
            return (
              <div
                key={card.title}
                style={{
                  background: COLORS.white,
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderTop: `3px solid ${card.borderColor || COLORS.primary}`,
                  borderRadius: 12,
                  padding: "28px 24px",
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
                {Icon && (
                  <IconBadge
                    icon={Icon}
                    size="md"
                    tone={
                      card.subLabel === "AVAILABLE NOW" ? "primary" : "neutral"
                    }
                  />
                )}
                {card.subLabel && (
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      letterSpacing: 2,
                      color: card.borderColor || COLORS.primary,
                      marginBottom: 6,
                      fontWeight: 600,
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
