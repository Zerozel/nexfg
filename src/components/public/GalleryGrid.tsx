import { YouTubeEmbed } from './YouTubeEmbed';

interface GalleryGridProps {
  gallery: { url: string; type: string }[];
}

export function GalleryGrid({ gallery }: GalleryGridProps) {
  if (!gallery || gallery.length === 0) {
    return <p className="text-center text-gray-500 py-12">No gallery items yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gallery.map((item, index) => (
        <div key={index} className="hover:-translate-y-1 transition-transform duration-200">
          <YouTubeEmbed url={item.url} />
        </div>
      ))}
    </div>
  );
}
