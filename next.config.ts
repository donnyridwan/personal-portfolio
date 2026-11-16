import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Situs Framer ada di public/index.html; "/" menampilkannya apa adanya.
  async rewrites() {
    return [{ source: '/', destination: '/index.html' }];
  },
};

export default nextConfig;
