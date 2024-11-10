/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    // Ensure CSS/SCSS modules are enabled
    webpack: (config) => {
        return config;
    },
}

module.exports = nextConfig
