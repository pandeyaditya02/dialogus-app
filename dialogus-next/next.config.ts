/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i3.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", port: "", pathname: "/vi/**"},
    ],
  },
};

export default nextConfig;
