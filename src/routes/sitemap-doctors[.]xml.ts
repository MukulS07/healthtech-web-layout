import { createFileRoute } from "@tanstack/react-router";
import { doctorUrls, urlset, xmlResponse } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap-doctors.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return xmlResponse(urlset(await doctorUrls()));
        } catch (err) {
          console.error("sitemap-doctors failed:", err);
          return xmlResponse(urlset([]));
        }
      },
    },
  },
});
