/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@circuit-lab/sim-core',
    '@circuit-lab/render-webgl',
    'three',
  ],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['three'],
  },
};

module.exports = nextConfig;
