// next.config.js o next.config.ts
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hdpltlgfrbpwaorrntrd.supabase.co',
        pathname: '/storage/v1/object/public/product-images/**',
      },
    ],
  },
};

export default nextConfig;
