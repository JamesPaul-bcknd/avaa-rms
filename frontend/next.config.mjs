/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
      },
      {
        // For your local Laravel/Backend development
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        // Supporting your local valet/custom domain if used
        protocol: 'http',
        hostname: 'backend.test',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;