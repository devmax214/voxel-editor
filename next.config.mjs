/** @type {import('next').NextConfig} */
import ThreeMinifierPlugin from '@yushijinhun/three-minifier-webpack'

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
    distDir: './dist', // Changes the build output directory to `./dist/`.
}

export default nextConfig
