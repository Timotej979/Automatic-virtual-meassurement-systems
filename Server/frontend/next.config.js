/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  // if you have enabled gzip on nginx disable compress to offload Node.js process
  compress: false,
};

module.exports = nextConfig
