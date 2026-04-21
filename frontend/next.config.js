/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Changed from 'standalone'
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;