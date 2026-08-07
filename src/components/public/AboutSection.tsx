interface AboutSectionProps {
  aboutText: string | null;
  primaryColor: string;
  slug: string;
}

export function AboutSection({ aboutText, primaryColor, slug }: AboutSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1A1A2E' }}>About Us</h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 rounded-lg border border-gray-200 shadow-sm hover:-translate-y-1 transition-transform" style={{ borderTopColor: primaryColor, borderTopWidth: '4px' }}>
            <h3 className="font-bold text-lg mb-3" style={{ color: '#1A1A2E' }}>Our Mission</h3>
            <p className="text-gray-600">To empower students with knowledge, skills, and character to excel in a dynamic world.</p>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 shadow-sm hover:-translate-y-1 transition-transform" style={{ borderTopColor: primaryColor, borderTopWidth: '4px' }}>
            <h3 className="font-bold text-lg mb-3" style={{ color: '#1A1A2E' }}>Our Vision</h3>
            <p className="text-gray-600">To be a center of educational excellence and innovation, nurturing future leaders.</p>
          </div>
        </div>

        {aboutText && (
          <div className="max-w-3xl mx-auto text-gray-600 leading-relaxed text-center">
            <p>{aboutText}</p>
          </div>
        )}

        <div className="text-center mt-8">
          <a href={`/school/${slug}/about`} className="inline-flex items-center font-medium transition-colors hover:underline" style={{ color: primaryColor }}>
            Learn More About Us →
          </a>
        </div>
      </div>
    </section>
  );
}
