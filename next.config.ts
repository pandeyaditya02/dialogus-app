/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i3.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "randomuser.me", pathname: "/api/**" },
    ],
  },
};

export default nextConfig;
