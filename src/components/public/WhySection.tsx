import { BookOpen, Users, Sparkles, Shield } from 'lucide-react';
import { DESIGN_TOKENS } from '@/lib/public/design-tokens';

interface WhySectionProps {
  schoolName: string;
  primaryColor: string;
}

const HIGHLIGHTS = [
  {
    icon: Users,
    title: 'Small Class Sizes',
    description:
      'Every child receives individual attention in classrooms designed for focused learning.',
  },
  {
    icon: BookOpen,
    title: 'Qualified Educators',
    description:
      'Experienced teachers who are committed to bringing out the best in every student.',
  },
  {
    icon: Sparkles,
    title: 'Holistic Curriculum',
    description:
      'Academics, arts, sports, and character — balanced development, not just exam scores.',
  },
  {
    icon: Shield,
    title: 'Safe Environment',
    description:
      'A secure, nurturing campus where students can learn, play, and grow with confidence.',
  },
];

export function WhySection({ schoolName, primaryColor }: WhySectionProps) {
  return (
    <section
      className="py-24 md:py-32"
      style={{ backgroundColor: DESIGN_TOKENS.neutral.surfaceAlt }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div
            className="mb-5 inline-flex items-center gap-3"
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
              Why {schoolName}
            </span>
            <div
              className="w-12 h-px"
              style={{ backgroundColor: DESIGN_TOKENS.accent.gold }}
            />
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
            An education that lasts a lifetime.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-lg transition-transform duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: DESIGN_TOKENS.neutral.surface,
                  boxShadow: DESIGN_TOKENS.shadow.sm,
                }}
              >
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${primaryColor}14` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                    strokeWidth={1.75}
                  />
                </div>

                <h3
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    lineHeight: 1.3,
                    color: DESIGN_TOKENS.neutral.ink,
                    fontVariationSettings: '"opsz" 32, "SOFT" 50',
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: DESIGN_TOKENS.neutral.inkSoft,
                  }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
