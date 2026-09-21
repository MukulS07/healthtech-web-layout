import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { DEFAULT_LOCALE, localeFromPath, type Locale } from "./lib/i18n/locales";

/**
 * The locale for this render, taken from the first path segment.
 *
 * On the client that's `window.location.pathname`. On the server it comes from the request, which
 * is why this is async — `getRequestUrl` is a server-only module, loaded behind `import.meta.env.SSR`
 * so it's tree-shaken out of the browser bundle. It reads Start's per-request async context, not a
 * global, so concurrent requests can't see each other's locale.
 */
async function currentLocale(): Promise<Locale> {
  if (import.meta.env.SSR) {
    try {
      const { getRequestUrl } = await import("@tanstack/react-start/server");
      return localeFromPath(new URL(getRequestUrl()).pathname);
    } catch {
      return DEFAULT_LOCALE;
    }
  }
  return localeFromPath(window.location.pathname);
}

/**
 * Mounts the whole route tree under a language prefix (/hi/doctors matches the /doctors route, and
 * every URL the router generates gets /hi back).
 *
 * This deliberately uses `rewrite` rather than `basepath`: TanStack Start overwrites `basepath`
 * with the build-time TSS_ROUTER_BASEPATH on every request (see `router.update({ basepath })` in
 * start-server-core/createStartHandler), so a per-request basepath is silently discarded and every
 * /hi/* URL 404s. `rewrite` is left alone, and does the same job in both directions.
 */
function localeRewrite(locale: Locale) {
  if (locale === DEFAULT_LOCALE) return undefined;
  const prefix = `/${locale}`;
  return {
    // URL the browser asked for -> path the route tree should match.
    input: ({ url }: { url: URL }) => {
      if (url.pathname === prefix) url.pathname = "/";
      else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
      return url;
    },
    // Path the router built -> URL the reader sees, so links stay in-language.
    output: ({ url }: { url: URL }) => {
      if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
        url.pathname = url.pathname === "/" ? prefix : `${prefix}${url.pathname}`;
      }
      return url;
    },
  };
}

export const getRouter = async () => {
  const queryClient = new QueryClient();
  const locale = await currentLocale();

  // Spread rather than pass undefined: exactOptionalPropertyTypes rejects an explicit undefined.
  const rewrite = localeRewrite(locale);
  const router = createRouter({
    routeTree,
    // locale travels in router context so __root can put it in React context for <A> and <html lang>.
    context: { queryClient, locale },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(rewrite ? { rewrite } : {}),
  });

  return router;
};
