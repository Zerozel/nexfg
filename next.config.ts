import type { NextConfig } from 'next';

const PDF_FONT_FILES = [
  'node_modules/pdfkit/js/data/*.afm',
  'node_modules/pdfkit/js/standard-fonts/*.cjs',
];

const nextConfig: NextConfig = {
  // This externalizes pdfkit for PDF generation.
  // Do NOT add 'tailwindcss' or 'postcss' here — they are already
  // in Next.js's default external list [citation:16].
  serverExternalPackages: ['pdfkit'],

  outputFileTracingIncludes: {
    '/api/admin/score-sheets/batches/[id]/pdf': PDF_FONT_FILES,
    '/api/report-cards/class/[classId]/pdf': PDF_FONT_FILES,
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'nexaforges.me'],
    },
  },
};

export default nextConfig;
