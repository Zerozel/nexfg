import { SocialLinks } from './SocialLinks';
import Link from 'next/link';
import { DESIGN_TOKENS } from '@/lib/public/design-tokens';

interface SchoolFooterProps {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  slug: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  socialLinks: {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
  } | null;
}

export function SchoolFooter({
  name,
  logoUrl,
  primaryColor,
  slug,
  contactEmail,
  contactPhone,
  address,
  socialLinks,
}: SchoolFooterProps) {
  return (
    <footer
      className="text-white"
      style={{ backgroundColor: DESIGN_TOKENS.neutral.surfaceDeep }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-12 w-12 object-contain rounded-md bg-white p-1"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-md flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <h3
              className="mb-3"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: '1.5rem',
                fontWeight: 500,
                fontVariationSettings: '"opsz" 40, "SOFT" 50',
              }}
            >
              {name}
            </h3>
            {address && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255, 255, 255, 0.55)' }}
              >
                {address}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4
              className="text-xs uppercase mb-5"
              style={{
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.15em',
                fontWeight: 600,
                color: DESIGN_TOKENS.accent.gold,
              }}
            >
              Explore
            </h4>
            <div className="space-y-3 text-sm">
              <Link
                href={`/school/${slug}`}
                className="block transition-colors hover:text-white"
                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
              >
                Home
              </Link>
              <Link
                href={`/school/${slug}/about`}
                className="block transition-colors hover:text-white"
                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
              >
                About
              </Link>
              <Link
                href={`/school/${slug}/gallery`}
                className="block transition-colors hover:text-white"
                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
              >
                Gallery
              </Link>
              <Link
                href={`/school/${slug}/contact`}
                className="block transition-colors hover:text-white"
                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs uppercase mb-5"
              style={{
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.15em',
                fontWeight: 600,
                color: DESIGN_TOKENS.accent.gold,
              }}
            >
              Get in Touch
            </h4>
            <div
              className="space-y-3 text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.65)' }}
            >
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="block transition-colors hover:text-white"
                >
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="block transition-colors hover:text-white"
                >
                  {contactPhone}
                </a>
              )}
            </div>
            {socialLinks && (
              <div className="mt-6">
                <SocialLinks
                  links={socialLinks}
                  color="rgba(255, 255, 255, 0.5)"
                  hoverColor={DESIGN_TOKENS.accent.gold}
                />
              </div>
            )}
          </div>
        </div>

        <div
          className="mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <p
            className="text-xs"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <p
            className="text-xs"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            Powered by{' '}
            <span
              style={{
                color: DESIGN_TOKENS.accent.gold,
                fontWeight: 600,
              }}
            >
              NexaForges
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
