/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      // Keep stale data for 5 minutes while revalidating
      dynamic: 300000,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i3.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", port: "", pathname: "/vi/**"},
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=43200, stale-while-revalidate=7200',
          }
        ],
      },
    ];
  },
};

export default nextConfig;