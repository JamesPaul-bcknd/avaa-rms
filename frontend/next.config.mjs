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
        ],
        domains: ['backend.test', 'http://127.0.0.1:8000'],
    },
};

export default nextConfig;
