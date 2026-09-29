import type { LucideIcon } from "lucide-react";
import { Camera, CalendarCheck, MessageCircle } from "lucide-react";
import { COLORS, COMING_SOON_ITEMS } from "@/lib/marketing/constants";
import { IconBadge } from "./IconBadge";
import { SectionDivider } from "./SectionDivider";

const ICON_MAP: Record<string, LucideIcon> = {
  Camera,
  CalendarCheck,
  MessageCircle,
};

export function ComingSoonSection() {
  return (
    <section
      className="section-padding"
      id="coming-soon"
      style={{ background: COLORS.white }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <SectionDivider
          kicker="In Development"
          title="What we are building next."
          subtitle="We do not sell features before they exist. These are the capabilities we are actively working on — and we will announce each one to our schools as it becomes available."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 56,
          }}
        >
          {COMING_SOON_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
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

                <div style={{ marginTop: 8 }}>
                  {Icon && <IconBadge icon={Icon} size="md" tone="gold" />}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
