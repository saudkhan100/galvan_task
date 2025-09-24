/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    appDir: false, // disable the new app directory
    
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;
