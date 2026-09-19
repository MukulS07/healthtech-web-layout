import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          [
            "User-agent: *",
            "Allow: /",
            "Disallow: /admin",
            "Disallow: /account",
            "Disallow: /api/",
            "Disallow: /_serverFn/",
            "Disallow: /forgot-password",
            "Disallow: /reset-password",
            "Disallow: /reviews/write",
            "Disallow: /*?utm_",
            "Disallow: /*?q=",
            "",
            `Sitemap: ${SITE.url}/sitemap.xml`,
            "",
          ].join("\n"),
          { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" } },
        ),
    },
  },
});
