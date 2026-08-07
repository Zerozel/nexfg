import { SchoolHeader } from './SchoolHeader';
import { SchoolFooter } from './SchoolFooter';

interface SchoolLayoutProps {
  children: React.ReactNode;
  school: {
    name: string;
    slug: string;
    logo_url: string | null;
    website_theme: { primary_color: string; font: string } | null;
    website_content: {
      contact_email?: string | null;
      contact_phone?: string | null;
      address?: string | null;
    } | null;
    social_links: { facebook?: string | null; twitter?: string | null; instagram?: string | null } | null;
  };
}

export function SchoolLayout({ children, school }: SchoolLayoutProps) {
  const primaryColor = school.website_theme?.primary_color || '#2563eb';
  const font = school.website_theme?.font || 'Inter';

  return (
    <div style={{ fontFamily: `'${font}', sans-serif` }}>
      <SchoolHeader name={school.name} logoUrl={school.logo_url} primaryColor={primaryColor} slug={school.slug} />
      <main className="min-h-screen">{children}</main>
      <SchoolFooter
        name={school.name}
        logoUrl={school.logo_url}
        primaryColor={primaryColor}
        slug={school.slug}
        contactEmail={school.website_content?.contact_email || null}
        contactPhone={school.website_content?.contact_phone || null}
        address={school.website_content?.address || null}
        socialLinks={school.social_links}
      />
    </div>
  );
}
