import type { AnchorHTMLAttributes } from "react";
import { useLocale } from "@/lib/i18n/context";
import { DEFAULT_LOCALE, localePath } from "@/lib/i18n/locales";

/**
 * A plain anchor that keeps the reader in their language.
 *
 * This codebase navigates with real <a href> rather than TanStack's <Link> almost everywhere (see
 * AGENTS.md / CLAUDE.md), and a raw anchor bypasses the router's locale rewrite — so on a Hindi
 * page every link would quietly drop the reader back into English, and a crawler would never find
 * the translated pages. <A> adds the prefix at render time, on the server and the client alike, so
 * there's no hydration mismatch.
 *
 * Left untouched: absolute URLs, protocol-relative URLs, mailto:/tel:/whatsapp links, in-page
 * anchors, and the paths in NEVER_LOCALISE (server functions, sitemaps, /admin).
 */
export function A({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const locale = useLocale();
  return <a href={localiseHref(href, locale)} {...rest} />;
}

function localiseHref(href: string | undefined, locale: string): string | undefined {
  if (!href || locale === DEFAULT_LOCALE) return href;
  if (!href.startsWith("/") || href.startsWith("//")) return href; // external, mailto, tel, #…
  if (/^\/(_serverFn|api|admin|assets|sitemap|robots\.txt|og-default|favicon|icon-|apple-touch-)/.test(href)) {
    return href;
  }
  const [path = "", suffix = ""] = splitSuffix(href);
  return `${localePath(path, locale as never)}${suffix}`;
}

/** Splits "/doctors?city=Pune#top" into ["/doctors", "?city=Pune#top"]. */
function splitSuffix(href: string): [string, string] {
  const i = href.search(/[?#]/);
  return i === -1 ? [href, ""] : [href.slice(0, i), href.slice(i)];
}
