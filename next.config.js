/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    // Ensure CSS/SCSS modules are enabled
    webpack: (config) => {
        return config;
    },
    images: {
        domains: ['yashl-preview.s3.ap-southeast-1.amazonaws.com'],
    },
}

module.exports = nextConfig
