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
          // 500 rather than an empty urlset — see the note in sitemap-hospitals[.]xml.ts.
          return new Response("sitemap generation failed", { status: 500 });
        }
      },
    },
  },
});
