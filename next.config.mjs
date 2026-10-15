/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Signal images uploaded via the admin page live in Vercel Blob
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
