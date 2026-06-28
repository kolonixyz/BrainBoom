/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.chunkFilename = 'static/chunks/[contenthash:8].js';
      config.output.filename = 'static/chunks/[contenthash:8].js';

      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          game: {
            name: () => `g-${Math.random().toString(36).substr(2, 8)}`,
            test: /[\/]components[\/]game[\/]/,
            priority: 10,
          },
          chat: {
            name: () => `c-${Math.random().toString(36).substr(2, 8)}`,
            test: /[\/]components[\/]chat[\/]/,
            priority: 10,
          },
          vendor: {
            name: () => `v-${Math.random().toString(36).substr(2, 8)}`,
            test: /[\/]node_modules[\/]/,
            priority: 5,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
