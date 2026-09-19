import { createFileRoute } from "@tanstack/react-router";
import { hospitalUrls, urlset, xmlResponse } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap-hospitals.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return xmlResponse(urlset(await hospitalUrls()));
        } catch (err) {
          console.error("sitemap-hospitals failed:", err);
          return xmlResponse(urlset([]));
        }
      },
    },
  },
});
