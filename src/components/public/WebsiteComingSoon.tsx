interface WebsiteComingSoonProps {
  schoolName: string;
  logoUrl: string | null;
  primaryColor: string;
}

export function WebsiteComingSoon({
  schoolName,
  logoUrl,
  primaryColor,
}: WebsiteComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="text-center max-w-md">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={schoolName}
            className="h-20 w-20 object-contain mx-auto mb-6 rounded-lg bg-white p-2 border"
          />
        ) : (
          <div
            className="h-20 w-20 mx-auto mb-6 rounded-lg flex items-center justify-center text-white font-bold text-3xl"
            style={{ backgroundColor: primaryColor }}
          >
            {schoolName.charAt(0)}
          </div>
        )}

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: '#1A1A2E' }}
        >
          {schoolName}
        </h1>

        <div
          className="w-12 h-1 mx-auto rounded-full mb-6"
          style={{ backgroundColor: primaryColor }}
        />

        <p className="text-gray-600 mb-2">
          This school website is coming soon.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          The school hasn&apos;t published their site yet. Check back later.
        </p>

        <a
          href="https://nexaforges.me"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          Powered by NexaForges
        </a>
      </div>
    </div>
  );
}
