/** @type {import('next').NextConfig} */
import ThreeMinifierPlugin from '@yushijinhun/three-minifier-webpack';

export function middleware(request) {
  const response = NextResponse.next()

  response.headers.set('Access-Control-Allow-Origin', '*')

  return response 
}

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compress: true,
  images: {
    domains: [
      // add images domains here
    ],
  },
  poweredByHeader: false,
  webpack(config, { isServer, dev }) {
    if (!isServer && !dev) {
      config.cache = false
      const threeMinifier = new ThreeMinifierPlugin()
      config.plugins.unshift(threeMinifier)
      config.resolve.plugins.unshift(threeMinifier.resolver)
    }

    return config
  },
};

export default nextConfig;
