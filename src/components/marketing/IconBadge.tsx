import type { LucideIcon } from "lucide-react";

type IconSize = "sm" | "md" | "lg";
type IconTone = "primary" | "gold" | "neutral" | "light";

interface IconBadgeProps {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  /**
   * Optional. When true the badge sits flush with the top of its parent
   * without the default bottom margin. Useful inside tight card layouts.
   */
  flush?: boolean;
}

const SIZES: Record<IconSize, { box: number; icon: number; radius: number }> = {
  sm: { box: 32, icon: 16, radius: 8 },
  md: { box: 44, icon: 22, radius: 12 },
  lg: { box: 56, icon: 28, radius: 14 },
};

const TONES: Record<IconTone, { bg: string; fg: string }> = {
  primary: { bg: "rgba(26,92,58,0.10)", fg: "#1a5c3a" },
  gold: { bg: "rgba(201,153,26,0.15)", fg: "#c9991a" },
  neutral: { bg: "rgba(0,0,0,0.05)", fg: "#4a4a4a" },
  light: { bg: "rgba(255,255,255,0.08)", fg: "#ffffff" },
};

export function IconBadge({
  icon: Icon,
  size = "md",
  tone = "primary",
  flush = false,
}: IconBadgeProps) {
  const dims = SIZES[size];
  const colors = TONES[tone];

  return (
    <div
      style={{
        width: dims.box,
        height: dims.box,
        borderRadius: dims.radius,
        background: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: flush ? 0 : 16,
        flexShrink: 0,
      }}
    >
      <Icon size={dims.icon} strokeWidth={1.75} color={colors.fg} />
    </div>
  );
}
