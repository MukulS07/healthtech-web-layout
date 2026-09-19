import { createFileRoute } from "@tanstack/react-router";
import { sitemapIndex, xmlResponse } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => xmlResponse(sitemapIndex(["/sitemap-pages.xml", "/sitemap-doctors.xml", "/sitemap-hospitals.xml"])),
    },
  },
});
