import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ]
  },
  /* config options here */
   images: {
    unoptimized: true,
  },
};

export default nextConfig;
