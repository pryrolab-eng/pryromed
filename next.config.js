/** @type {import('next').NextConfig} */

const pharmacyRedirects = require('./src/lib/routes/pharmacy-paths.redirects.cjs');

const isDev = process.env.NODE_ENV === 'development';
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
        // In production, proxy /api/* to the NestJS backend server-side.
        // This keeps the session cookie on the same domain (Vercel) — no cross-domain cookie issues.
        // The 8 Next.js auth route handlers (signout, refresh, etc.) take priority over this rewrite
        // because they are defined in src/app/api/ and Next.js matches app routes before rewrites.
        if (isDev) return []; // dev: use NEXT_PUBLIC_API_URL directly from the browser
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/dashboard/reset-password',
                destination: '/reset-password',
                permanent: true,
            },
            {
                source: '/dashboard',
                destination: '/app',
                permanent: true,
            },
            {
                source: '/payment-success',
                destination: '/payment/success',
                permanent: true,
            },
            ...pharmacyRedirects,
        ];
    },
    images: {
        unoptimized: isDev,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
            },
            {
                protocol: 'https',
                hostname: 'html.tailus.io',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    }
};

module.exports = nextConfig;
