import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limits build worker concurrency. Next.js otherwise auto-detects CPU
  // count and over-provisions workers, which exceeds the process/thread
  // limit on this shared hosting account (CloudLinux LVE), causing
  // "pthread_create: Resource temporarily unavailable" build failures.
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
