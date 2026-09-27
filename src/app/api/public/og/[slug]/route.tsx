import { ImageResponse } from 'next/og';
import { getPublicSchool } from '@/lib/public/get-school';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const school = await getPublicSchool(slug);

    if (!school) {
      return new Response('School not found', { status: 404 });
    }

    const primaryColor =
      school.website_theme?.primary_color || '#2563eb';
    const name = school.name || 'School';
    const motto = school.motto || '';
    const logoUrl = school.logo_url;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
            padding: 80,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Logo */}
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              width={140}
              height={140}
              style={{
                objectFit: 'contain',
                background: 'white',
                borderRadius: 20,
                padding: 16,
                marginBottom: 40,
              }}
            />
          )}

          {/* School name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: 1000,
            }}
          >
            {name}
          </div>

          {/* Motto */}
          {motto && (
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255,255,255,0.75)',
                marginTop: 24,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              {motto}
            </div>
          )}

          {/* Footer branding */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 60,
              fontSize: 20,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            Powered by NexaForges
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('[og] error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
