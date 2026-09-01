/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Compilação mais rápida no dev usando SWC (já padrão no Next 14)
  swcMinify: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Cache de imagens por 7 dias
    minimumCacheTTL: 604800,
  },

  // Headers de performance / cache para assets estáticos
  async headers() {
    return [
      {
        source: "/(.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2|woff|ttf))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // APIs com dados que mudam raramente podem ter micro-cache
        source: "/api/dashboard",
        headers: [
          {
            key: "Cache-Control",
            value: "private, s-maxage=60, stale-while-revalidate=30",
          },
        ],
      },
    ];
  },

  // Compressão de resposta (padrão, mas explícito)
  compress: true,
};

export default nextConfig;
