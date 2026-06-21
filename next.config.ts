import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/libraries",
        destination: "/map",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
