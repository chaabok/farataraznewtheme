import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: [],
  experimental: {
    // 4GB sandbox: force Turbopack to evict/GC instead of growing until
    // the kernel OOM-kills the dev server during big compile spikes.
    turbopackMemoryEviction: "full",
  },
};

export default nextConfig;
