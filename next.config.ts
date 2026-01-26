import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compression gzip/brotli pour réduire la taille des assets
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sptbanfynjwimqjugpoz.supabase.co",
        pathname: "/storage/v1/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    // Optimise les imports pour tree-shaking agressif
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-toast",
    ],
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
