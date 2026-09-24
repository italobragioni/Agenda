import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Permite upload de imagens (logo) via Server Actions até 5 MB.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
