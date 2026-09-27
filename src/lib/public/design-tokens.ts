/**
 * Design tokens for public school websites.
 *
 * Every school inherits this design system — they can override their primary
 * color, but the rest of the visual language (typography scale, spacing,
 * shadows, radii) is intentional and shared so every NexaForge school site
 * looks premium and consistent.
 */

export const DESIGN_TOKENS = {
  /**
   * Neutral palette — the foundation every school site sits on.
   * Warm-tinted instead of pure gray, which reads as "established"
   * rather than "tech startup".
   */
  neutral: {
    ink: "#1a1a1a",       // Primary text
    inkSoft: "#4a4a4a",   // Secondary text
    inkMuted: "#8a8a8a",  // Tertiary text
    line: "#e8e4dc",      // Borders and dividers (warm cream)
    surface: "#ffffff",   // Card backgrounds
    surfaceAlt: "#faf8f3", // Section backgrounds (warm cream)
    surfaceDeep: "#1a1a1a", // Dark sections (footers)
  },

  /**
   * Accent — the metallic that signals "premium" and "established".
   * Used sparingly: dividers under headlines, icon accents, hover states.
   */
  accent: {
    gold: "#c9991a",
    goldSoft: "rgba(201, 153, 26, 0.15)",
    goldDeep: "#8f6a0f",
  },

  /**
   * Typography scale. Serif for display, sans for body.
   * Sizes are in rem — 1rem = 16px by default.
   */
  type: {
    display: {
      xl: "clamp(3rem, 8vw, 6rem)",   // Hero headline
      lg: "clamp(2.25rem, 5vw, 3.5rem)", // Section headline
      md: "clamp(1.75rem, 3.5vw, 2.5rem)", // Subsection
    },
    body: {
      lg: "1.125rem",  // 18px — intro paragraphs
      md: "1rem",      // 16px — default
      sm: "0.875rem",  // 14px — captions
      xs: "0.75rem",   // 12px — labels, kickers
    },
  },

  /**
   * Spacing scale. Every margin/padding uses a value from this set.
   * Consistent rhythm is what makes premium sites feel "designed".
   */
  space: {
    xs: "0.5rem",   // 8px
    sm: "1rem",     // 16px
    md: "1.5rem",   // 24px
    lg: "2.5rem",   // 40px
    xl: "4rem",     // 64px
    "2xl": "6rem",  // 96px — section padding
    "3xl": "8rem",  // 128px — hero padding
  },

  /**
   * Border radius. Slightly rounded, never pill-shaped.
   * Pill shapes read as "consumer app"; the design language here is
   * institutional and confident.
   */
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "20px",
  },

  /**
   * Shadows. Soft, warm-tinted. Not the harsh default gray-blue.
   */
  shadow: {
    sm: "0 1px 2px rgba(26, 26, 26, 0.05)",
    md: "0 4px 12px rgba(26, 26, 26, 0.08)",
    lg: "0 12px 32px rgba(26, 26, 26, 0.12)",
    xl: "0 24px 64px rgba(26, 26, 26, 0.16)",
  },

  /**
   * Transitions. Consistent motion makes the site feel intentional.
   */
  motion: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

/**
 * Default primary color fallback for schools that haven't configured one.
 * Kept as a deep, sophisticated blue that pairs well with gold.
 */
export const DEFAULT_PRIMARY = "#1e3a5f";
