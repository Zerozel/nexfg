import type { LucideIcon } from "lucide-react";
import {
  Users,
  Landmark,
  ClipboardPen,
  BarChart3,
  GraduationCap,
  Globe,
} from "lucide-react";
import { COLORS, SERVICE_CARDS } from "@/lib/marketing/constants";
import { IconBadge } from "./IconBadge";
import { SectionDivider } from "./SectionDivider";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Landmark,
  ClipboardPen,
  BarChart3,
  GraduationCap,
  Globe,
};

export function PlatformSection() {
  return (
    <section
      className="section-padding"
      id="platform"
      style={{ background: COLORS.white }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <SectionDivider
          kicker="Available Today"
          title="What we do — right now."
          subtitle="The NexaForge platform is live and used by schools today. These are the workflows it handles — the ones that consume the most time for administrators and teachers."
        />

        <div
          id="schools"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 56,
          }}
        >
          {SERVICE_CARDS.map((card) => {
            const Icon = ICON_MAP[card.icon];
            return (
              <div
                key={card.title}
                style={{
                  background: COLORS.white,
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderTop: `3px solid ${COLORS.primary}`,
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
                {Icon && <IconBadge icon={Icon} size="md" tone="primary" />}
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "1.1rem",
                    color: COLORS.text,
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
