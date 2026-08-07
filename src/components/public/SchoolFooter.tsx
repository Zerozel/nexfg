import { SocialLinks } from './SocialLinks';
import Link from 'next/link';

interface SchoolFooterProps {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  slug: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  socialLinks: { facebook?: string | null; twitter?: string | null; instagram?: string | null } | null;
}

export function SchoolFooter({ name, logoUrl, primaryColor, slug, contactEmail, contactPhone, address, socialLinks }: SchoolFooterProps) {
  return (
    <footer className="text-white" style={{ backgroundColor: '#1A1A2E' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={name} className="h-10 w-10 object-contain rounded bg-white p-1" />
              ) : (
                <div className="h-10 w-10 rounded flex items-center justify-center font-bold text-lg" style={{ backgroundColor: primaryColor }}>{name.charAt(0)}</div>
              )}
              <span className="font-semibold text-lg">{name}</span>
            </div>
            {address && <p className="text-sm text-gray-400">{address}</p>}
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href={`/school/${slug}`} className="block hover:text-white transition-colors">Home</Link>
              <Link href={`/school/${slug}/about`} className="block hover:text-white transition-colors">About</Link>
              <Link href={`/school/${slug}/contact`} className="block hover:text-white transition-colors">Contact</Link>
              <Link href={`/school/${slug}/gallery`} className="block hover:text-white transition-colors">Gallery</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400">
              {contactEmail && <p>{contactEmail}</p>}
              {contactPhone && <p>{contactPhone}</p>}
            </div>
            <div className="mt-4">
              <SocialLinks links={socialLinks} color="#9CA3AF" hoverColor="#FFFFFF" />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          Powered by NexaForges
        </div>
      </div>
    </footer>
  );
}
