'use client';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden shadow-md">
      <iframe
        src={url}
        title={title || 'Gallery video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
