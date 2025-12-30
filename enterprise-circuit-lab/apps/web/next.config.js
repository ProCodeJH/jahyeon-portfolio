/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@circuit-lab/sim-core', '@circuit-lab/render-webgl', '@circuit-lab/avr-runtime', '@circuit-lab/ui'],
  webpack: (config) => {
    // Handle canvas for PixiJS in SSR
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
