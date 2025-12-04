import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Standalone output only for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Tắt dev indicator (icon Next.js ở góc dưới)
  devIndicators: false as any,
  // Cho phép cross-origin requests trong dev mode (fix warning)
  // Cho phép cả localhost và VPS IP
  allowedDevOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['localhost', '127.0.0.1', '68.183.162.122'],
  // Đảm bảo SSE hoạt động trong dev mode
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Headers cho SSE và CORS
  async headers() {
    return [
      {
        source: '/api/esp32/stream',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-transform',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
