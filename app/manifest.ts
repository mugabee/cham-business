import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cham Business Ltd",
    short_name: "Cham Business",
    description:
      "Cham Business Ltd is a registered non-deposit lender offering fast, fair personal loans to individuals across Rwanda.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf8",
    theme_color: "#2563b8",
    icons: [
      { src: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/brand/favicon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/brand/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
