'use client';

interface HeroSectionProps {
  title: string;
  subtitle: string | null;
  motto: string | null;
  primaryColor: string;
  slug: string;
}

export function HeroSection({ title, subtitle, motto, primaryColor, slug }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 animate-in fade-in duration-500">
      <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, transparent 50%)` }} />
      <div className="max-w-[1200px] mx-auto px-4 text-center relative z-10">
        {motto && (
          <p className="text-sm uppercase tracking-widest mb-4 font-medium" style={{ color: primaryColor }}>{motto}</p>
        )}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: '#1A1A2E' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={`/school/${slug}/about`} className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105" style={{ backgroundColor: primaryColor }}>
            Learn More
          </a>
          <a href={`/school/${slug}/contact`} className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 transition-all hover:scale-105" style={{ borderColor: primaryColor, color: primaryColor }}>
            Contact Us
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100'%3E%3Cpath fill='%23ffffff' d='M0,64L120,58.7C240,53,480,43,720,48C960,53,1200,75,1320,85.3L1440,96L1440,100L1320,100C1200,100,960,100,720,100C480,100,240,100,120,100L0,100Z'%3E%3C/path%3E%3C/svg%3E") no-repeat bottom/cover` }} />
    </section>
  );
}
