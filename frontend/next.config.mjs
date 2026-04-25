/** @type {import('next').NextConfig} */
// Proxy all API calls to the FastAPI backend (see ../backend/server.py). Run: uvicorn on 8000.
const backend = (process.env.BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
