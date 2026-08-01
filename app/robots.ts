import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/api", "/login", "/forgot-password", "/reset-password"],
    },
    sitemap: "https://chambusiness.org/sitemap.xml",
  };
}
