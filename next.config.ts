import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: {
    qualities: [75, 85, 90, 100],
  },
}

export default nextConfig
