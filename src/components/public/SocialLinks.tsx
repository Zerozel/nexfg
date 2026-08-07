interface SocialLinksProps {
  links: { facebook?: string | null; twitter?: string | null; instagram?: string | null } | null;
  color?: string;
  hoverColor?: string;
}

export function SocialLinks({ links, color = '#6B7280', hoverColor = '#2563eb' }: SocialLinksProps) {
  if (!links) return null;
  return (
    <div className="flex gap-4">
      {links.facebook && (
        <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color }} onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)} onMouseLeave={(e) => (e.currentTarget.style.color = color)}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
      )}
      {links.twitter && (
        <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color }} onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)} onMouseLeave={(e) => (e.currentTarget.style.color = color)}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      )}
      {links.instagram && (
        <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color }} onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)} onMouseLeave={(e) => (e.currentTarget.style.color = color)}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.004 5.838a6.157 6.157 0 0 0-6.158 6.158 6.157 6.157 0 0 0 6.158 6.158 6.157 6.157 0 0 0 6.158-6.158 6.157 6.157 0 0 0-6.158-6.158zm0 10.155a3.998 3.998 0 1 1 0-7.996 3.998 3.998 0 0 1 0 7.996zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/></svg>
        </a>
      )}
    </div>
  );
}
