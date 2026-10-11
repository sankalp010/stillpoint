/** @type {import('next').NextConfig} */
const apiBackendOrigin = process.env.API_BACKEND_ORIGIN?.replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!apiBackendOrigin) return [];
    return [{
      source: '/api/:path*',
      destination: `${apiBackendOrigin}/api/:path*`,
    }];
  },
};

export default nextConfig;
