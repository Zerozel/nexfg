import Link from 'next/link';
import { DESIGN_TOKENS } from '@/lib/public/design-tokens';

interface AboutSectionProps {
  aboutText: string | null;
  mission?: string | null;
  vision?: string | null;
  primaryColor: string;
  slug: string;
}

const DEFAULT_MISSION =
  'To empower students with knowledge, skills, and character to excel in a dynamic world.';
const DEFAULT_VISION =
  'To be a center of educational excellence and innovation, nurturing future leaders.';

export function AboutSection({
  aboutText,
  mission,
  vision,
  primaryColor,
  slug,
}: AboutSectionProps) {
  return (
    <section
      className="py-24 md:py-32"
      style={{ backgroundColor: DESIGN_TOKENS.neutral.surface }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div
            className="mb-5 flex items-center gap-3"
            style={{ color: DESIGN_TOKENS.accent.goldDeep }}
          >
            <div
              className="w-12 h-px"
              style={{ backgroundColor: DESIGN_TOKENS.accent.gold }}
            />
            <span
              className="text-xs uppercase"
              style={{
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.2em',
                fontWeight: 600,
              }}
            >
              Our Story
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: DESIGN_TOKENS.type.display.lg,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: DESIGN_TOKENS.neutral.ink,
              fontVariationSettings: '"opsz" 72, "SOFT" 50',
            }}
          >
            A community built on{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: DESIGN_TOKENS.accent.goldDeep,
              }}
            >
              purpose
            </em>
            .
          </h2>
        </div>

        {/* Two-column: text left, mission+vision right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Left column — about text */}
          <div className="lg:col-span-3">
            {aboutText ? (
              <div
                className="prose-lg leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.75,
                  color: DESIGN_TOKENS.neutral.inkSoft,
                }}
              >
                {aboutText.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-5 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.75,
                  color: DESIGN_TOKENS.neutral.inkMuted,
                }}
              >
                More information about our school is coming soon.
              </p>
            )}

            <Link
              href={`/school/${slug}/about`}
              className="inline-flex items-center gap-2 mt-10 text-sm font-semibold transition-colors"
              style={{
                fontFamily: 'var(--font-inter)',
                color: DESIGN_TOKENS.accent.goldDeep,
              }}
            >
              Read our full story
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Right column — mission + vision cards */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="p-8 rounded-lg"
              style={{
                backgroundColor: DESIGN_TOKENS.neutral.surfaceAlt,
                borderTop: `3px solid ${DESIGN_TOKENS.accent.gold}`,
              }}
            >
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  color: DESIGN_TOKENS.neutral.ink,
                  fontVariationSettings: '"opsz" 40, "SOFT" 50',
                }}
              >
                Our Mission
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: DESIGN_TOKENS.neutral.inkSoft,
                }}
              >
                {mission || DEFAULT_MISSION}
              </p>
            </div>

            <div
              className="p-8 rounded-lg"
              style={{
                backgroundColor: DESIGN_TOKENS.neutral.surfaceAlt,
                borderTop: `3px solid ${primaryColor}`,
              }}
            >
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  color: DESIGN_TOKENS.neutral.ink,
                  fontVariationSettings: '"opsz" 40, "SOFT" 50',
                }}
              >
                Our Vision
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: DESIGN_TOKENS.neutral.inkSoft,
                }}
              >
                {vision || DEFAULT_VISION}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
