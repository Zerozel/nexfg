'use client';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

/**
 * Normalize common YouTube URL shapes to the embeddable `/embed/{id}` form.
 * Accepts watch URLs, youtu.be short links, Shorts, and already-embed URLs.
 */
function toEmbedUrl(raw: string): string {
  if (!raw) return raw;
  if (raw.includes('/embed/')) return raw;

  try {
    const url = new URL(raw);
    let id = '';

    if (url.hostname.includes('youtu.be')) {
      id = url.pathname.slice(1);
    } else if (url.pathname.startsWith('/shorts/')) {
      id = url.pathname.split('/')[2] || '';
    } else if (url.searchParams.get('v')) {
      id = url.searchParams.get('v') || '';
    }

    return id ? `https://www.youtube.com/embed/${id}` : raw;
  } catch {
    return raw;
  }
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden shadow-md">
      <iframe
        src={toEmbedUrl(url)}
        title={title || 'Gallery video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
