import Link from 'next/link';
import { DESIGN_TOKENS } from '@/lib/public/design-tokens';
import { TrustSignals } from './TrustSignals';

interface HeroSignal {
  label: string;
  value: string;
}

interface HeroSectionProps {
  title: string;
  subtitle: string | null;
  motto: string | null;
  primaryColor: string;
  slug: string;
  signals?: HeroSignal[];
  backgroundImageUrl?: string | null;
}

export function HeroSection({
  title,
  subtitle,
  motto,
  primaryColor,
  slug,
  signals = [],
  backgroundImageUrl,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background image with dark overlay */}
      {backgroundImageUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(15, 15, 20, 0.85) 0%, rgba(15, 15, 20, 0.55) 60%, rgba(15, 15, 20, 0.35) 100%)`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${DESIGN_TOKENS.neutral.surfaceDeep} 100%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative max-w-[1200px] mx-auto px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          {/* Kicker — the motto in gold */}
          {motto && (
            <div
              className="mb-6 flex items-center gap-3"
              style={{ color: DESIGN_TOKENS.accent.gold }}
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
                {motto}
              </span>
            </div>
          )}

          {/* Display headline */}
          <h1
            className="mb-6"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: DESIGN_TOKENS.type.display.xl,
              fontWeight: 400,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              fontVariationSettings: '"opsz" 144, "SOFT" 40',
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="mb-10 max-w-2xl"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: DESIGN_TOKENS.type.body.lg,
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.82)',
              }}
            >
              {subtitle}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/school/${slug}/about`}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg font-medium transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: DESIGN_TOKENS.type.body.md,
                fontWeight: 600,
                backgroundColor: DESIGN_TOKENS.accent.gold,
                color: DESIGN_TOKENS.neutral.ink,
                boxShadow: DESIGN_TOKENS.shadow.lg,
              }}
            >
              Discover Our School
            </Link>
            <Link
              href={`/school/${slug}/contact`}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg font-medium border transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: DESIGN_TOKENS.type.body.md,
                fontWeight: 600,
                borderColor: 'rgba(255, 255, 255, 0.35)',
                borderWidth: '1.5px',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Book a Visit
            </Link>
          </div>
        </div>

        {/* Trust signals */}
        {signals.length > 0 && (
          <div className="mt-20 pt-10 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <TrustSignals signals={signals} variant="dark" />
          </div>
        )}
      </div>
    </section>
  );
}
