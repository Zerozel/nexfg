'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DESIGN_TOKENS } from '@/lib/public/design-tokens';

interface SchoolHeaderProps {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  slug: string;
}

export function SchoolHeader({
  name,
  logoUrl,
  primaryColor,
  slug,
}: SchoolHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { label: 'Home', href: `/school/${slug}` },
    { label: 'About', href: `/school/${slug}/about` },
    { label: 'Gallery', href: `/school/${slug}/gallery` },
    { label: 'Contact', href: `/school/${slug}/contact` },
  ];

  const isActive = (href: string) => {
    if (href === `/school/${slug}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${DESIGN_TOKENS.neutral.line}`,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href={`/school/${slug}`} className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={name}
              className="h-11 w-11 object-contain rounded-md"
            />
          ) : (
            <div
              className="h-11 w-11 rounded-md flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {name.charAt(0)}
            </div>
          )}
          <span
            className="hidden sm:block"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '1.25rem',
              fontWeight: 500,
              color: DESIGN_TOKENS.neutral.ink,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 32, "SOFT" 50',
            }}
          >
            {name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: active
                    ? DESIGN_TOKENS.neutral.ink
                    : DESIGN_TOKENS.neutral.inkSoft,
                }}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute left-4 right-4 -bottom-0.5 h-px"
                    style={{ backgroundColor: DESIGN_TOKENS.accent.gold }}
                  />
                )}
              </Link>
            );
          })}
          <Link
            href={`/school/${slug}/contact`}
            className="ml-4 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{
              fontFamily: 'var(--font-inter)',
              backgroundColor: DESIGN_TOKENS.neutral.ink,
              color: '#ffffff',
            }}
          >
            Apply Now
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 py-4 space-y-1"
          style={{
            backgroundColor: DESIGN_TOKENS.neutral.surface,
            borderTop: `1px solid ${DESIGN_TOKENS.neutral.line}`,
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2.5 text-base"
              style={{
                fontFamily: 'var(--font-inter)',
                color: DESIGN_TOKENS.neutral.inkSoft,
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={`/school/${slug}/contact`}
            className="block py-3 mt-2 rounded-lg text-center font-semibold"
            style={{
              fontFamily: 'var(--font-inter)',
              backgroundColor: DESIGN_TOKENS.neutral.ink,
              color: '#ffffff',
            }}
            onClick={() => setMenuOpen(false)}
          >
            Apply Now
          </Link>
        </div>
      )}
    </header>
  );
}
