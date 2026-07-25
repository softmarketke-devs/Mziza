/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['tesseract.js'],
  experimental: {
    largePageDataBytes: 512 * 1000
  }
};

export default nextConfig;
