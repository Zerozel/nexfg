import Link from 'next/link';
import { YouTubeEmbed } from './YouTubeEmbed';
import { DESIGN_TOKENS } from '@/lib/public/design-tokens';

interface GallerySectionProps {
  gallery: { url: string; type: string }[];
  primaryColor: string;
  slug: string;
}

export function GallerySection({
  gallery,
  primaryColor,
  slug,
}: GallerySectionProps) {
  // If there's no gallery, show a friendly empty state instead of nothing —
  // a school site with zero content looks broken; a site with a "coming soon"
  // panel looks intentional.
  if (!gallery || gallery.length === 0) {
    return (
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: DESIGN_TOKENS.neutral.surface }}
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
                Life at Our School
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
                color: DESIGN_TOKENS.neutral.ink,
                letterSpacing: '-0.02em',
                fontVariationSettings: '"opsz" 72, "SOFT" 50',
              }}
            >
              Moments that matter.
            </h2>
          </div>

          <div
            className="max-w-md mx-auto text-center p-12 rounded-lg"
            style={{
              backgroundColor: DESIGN_TOKENS.neutral.surfaceAlt,
              border: `1px dashed ${DESIGN_TOKENS.neutral.line}`,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.9375rem',
                color: DESIGN_TOKENS.neutral.inkMuted,
              }}
            >
              Photos and videos from our school will appear here soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const preview = gallery.slice(0, 6);

  return (
    <section
      className="py-24 md:py-32"
      style={{ backgroundColor: DESIGN_TOKENS.neutral.surface }}
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
              Life at Our School
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
              color: DESIGN_TOKENS.neutral.ink,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 72, "SOFT" 50',
            }}
          >
            Moments that matter.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {preview.map((item, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              style={{ boxShadow: DESIGN_TOKENS.shadow.md }}
            >
              <YouTubeEmbed url={item.url} />
            </div>
          ))}
        </div>

        {gallery.length > 6 && (
          <div className="text-center mt-14">
            <Link
              href={`/school/${slug}/gallery`}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--font-inter)',
                backgroundColor: DESIGN_TOKENS.neutral.ink,
                color: '#ffffff',
              }}
            >
              View Full Gallery
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
