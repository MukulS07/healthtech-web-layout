/**
 * Locale definitions and URL handling.
 *
 * English lives at the bare path (/doctors) and every other language sits under a prefix
 * (/hi/doctors, /ta/doctors), so each translation is a real, indexable, shareable URL rather than
 * a cookie-dependent view of the same one.
 *
 * How the prefix actually works, since no route file mentions it:
 *  1. `getRouter()` (src/router.tsx) sets TanStack Router's `basepath` to "/hi" etc., so the whole
 *     existing route tree matches under the prefix with no per-route changes.
 *  2. `localiseHtmlLinks()` below rewrites plain <a href="/..."> in the server-rendered HTML.
 *     The codebase uses plain anchors rather than <Link> nearly everywhere, and those bypass
 *     basepath — without this, every link on a Hindi page would drop the reader back into English
 *     and a crawler would never discover the translated pages.
 */

export const DEFAULT_LOCALE = "en";

export const LOCALES = [
  { code: "en", label: "English", endonym: "English", htmlLang: "en-IN" },
  { code: "hi", label: "Hindi", endonym: "हिन्दी", htmlLang: "hi-IN" },
  { code: "ta", label: "Tamil", endonym: "தமிழ்", htmlLang: "ta-IN" },
  { code: "te", label: "Telugu", endonym: "తెలుగు", htmlLang: "te-IN" },
  { code: "ml", label: "Malayalam", endonym: "മലയാളം", htmlLang: "ml-IN" },
  { code: "kn", label: "Kannada", endonym: "ಕನ್ನಡ", htmlLang: "kn-IN" },
  { code: "mr", label: "Marathi", endonym: "मराठी", htmlLang: "mr-IN" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

const CODES = LOCALES.map((l) => l.code) as readonly string[];
/** Prefixed locales only — "en" has no prefix. */
const PREFIXES = CODES.filter((c) => c !== DEFAULT_LOCALE);

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && CODES.includes(value);
}

export function localeInfo(code: Locale) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

/** The locale a pathname is asking for, from its first segment. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && PREFIXES.includes(first) ? (first as Locale) : DEFAULT_LOCALE;
}

/** "/hi" for prefixed locales, "/" for English — this is TanStack Router's `basepath`. */
export function basepathFor(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

/** The same path without any locale prefix ("/hi/doctors" → "/doctors"). */
export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return pathname || "/";
  const rest = pathname.slice(`/${locale}`.length);
  return rest === "" ? "/" : rest;
}

/** A site-relative path rewritten for a locale ("/doctors" + "hi" → "/hi/doctors"). */
export function localePath(pathname: string, locale: Locale): string {
  const bare = stripLocale(pathname);
  if (locale === DEFAULT_LOCALE) return bare;
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

/**
 * Paths that must never be localised: API/server-function endpoints, generated XML/robots, and the
 * admin area (staff-only, not translated). Rewriting these would break them.
 */
const NEVER_LOCALISE = /^\/(_serverFn|api|admin|assets|sitemap|robots\.txt|og-default|favicon)/;

/**
 * Rewrites site-relative hrefs in a rendered HTML document so they keep the reader in their
 * language. Only touches `href="/..."` in real attribute position — not absolute URLs, anchors,
 * mailto:/tel:, already-prefixed paths, or anything in NEVER_LOCALISE.
 */
export function localiseHtmlLinks(html: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return html;
  const prefix = `/${locale}`;
  return html.replace(/href="(\/[^"]*)"/g, (whole, path: string) => {
    if (path.startsWith("//")) return whole; // protocol-relative URL, not a site path
    if (path === prefix || path.startsWith(`${prefix}/`)) return whole; // basepath already added it
    if (NEVER_LOCALISE.test(path)) return whole;
    return `href="${prefix}${path === "/" ? "" : path}"`;
  });
}
