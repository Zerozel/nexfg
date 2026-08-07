import { YouTubeEmbed } from './YouTubeEmbed';

interface GallerySectionProps {
  gallery: { url: string; type: string }[];
  primaryColor: string;
  slug: string;
}

export function GallerySection({ gallery, primaryColor, slug }: GallerySectionProps) {
  if (!gallery || gallery.length === 0) return null;
  const preview = gallery.slice(0, 6);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1A1A2E' }}>Gallery</h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((item, index) => (
            <div key={index} className="hover:-translate-y-1 transition-transform duration-200">
              <YouTubeEmbed url={item.url} />
            </div>
          ))}
        </div>

        {gallery.length > 6 && (
          <div className="text-center mt-8">
            <a href={`/school/${slug}/gallery`} className="inline-flex items-center font-medium transition-colors hover:underline" style={{ color: primaryColor }}>
              View Full Gallery →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
