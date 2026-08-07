'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SchoolHeaderProps {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  slug: string;
}

export function SchoolHeader({ name, logoUrl, primaryColor, slug }: SchoolHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: 'Home', href: `/school/${slug}` },
    { label: 'About', href: `/school/${slug}/about` },
    { label: 'Contact', href: `/school/${slug}/contact` },
    { label: 'Gallery', href: `/school/${slug}/gallery` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: primaryColor }}>
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/school/${slug}`} className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="h-10 w-10 object-contain rounded" />
          ) : (
            <div className="h-10 w-10 rounded flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: primaryColor }}>
              {name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-lg hidden sm:block" style={{ color: '#1A1A2E' }}>{name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: '#4B5563' }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3 animate-in slide-in-from-right">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
