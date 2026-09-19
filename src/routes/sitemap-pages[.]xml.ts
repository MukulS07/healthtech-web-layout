import { createFileRoute } from "@tanstack/react-router";
import { pageUrls, urlset, xmlResponse } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: { handlers: { GET: async () => xmlResponse(urlset(pageUrls())) } },
});
