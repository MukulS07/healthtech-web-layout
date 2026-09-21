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
          // Deliberately a 500, not an empty urlset: an empty sitemap is indistinguishable from
          // "this site has no hospitals" and search engines take it at face value, so a failure
          // here silently de-indexed every hospital page. A 500 gets retried instead.
          return new Response("sitemap generation failed", { status: 500 });
        }
      },
    },
  },
});
