import type { MetadataRoute } from "next";
import { resources } from "@/lib/resources";

const BASE_URL = "https://chambusiness.org";

const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/loans", changeFrequency: "monthly", priority: 0.9 },
  { path: "/apply", changeFrequency: "monthly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/resources", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contract-template", changeFrequency: "yearly", priority: 0.3 },
  { path: "/service-charter", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries = routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articleEntries = resources.map((article) => ({
    url: `${BASE_URL}/resources/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...articleEntries];
}
