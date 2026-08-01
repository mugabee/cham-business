import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limits build worker concurrency. Next.js otherwise auto-detects CPU
  // count and over-provisions workers, which exceeds the process/thread
  // limit on this shared hosting account (CloudLinux LVE), causing
  // "pthread_create: Resource temporarily unavailable" build failures.
  experimental: {
    cpus: 1,
  },
  // Baseline security headers -- defense-in-depth on top of proxy.ts's
  // own HTTPS enforcement. HSTS pins visitors to HTTPS after their first
  // visit; the rest block a handful of well-known low-effort attacks
  // (clickjacking, MIME-sniffing, referrer leakage, unwanted browser
  // feature access) that cost nothing to close off on a site handling
  // real financial applications.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
