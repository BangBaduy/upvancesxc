/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'figma.com',
      },
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/**',
      },
      {
        // Foto profil Google OAuth
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        // Supabase Storage
        protocol: 'https',
        hostname: 'kmhfilbxwskbynjeuwld.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Foto profil Google OAuth (fallback domain)
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        // UIN Jakarta Assets
        protocol: 'https',
        hostname: 'asset.uinjkt.ac.id',
        pathname: '/**',
      },
      {
        // Allow images from any source for event posters (flexible but less secure - common for news/aggregator sites)
        protocol: 'https',
        hostname: '**',
      }
    ],
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;