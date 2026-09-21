import { SITE } from "@/lib/site";
import { DEFAULT_LOCALE, LOCALES, localeInfo, localePath, type Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/strings";

/**
 * Static pages whose <title> and description are translated (keys `meta.<name>.title` / `.desc`).
 * Deliberately limited to bare paths: a filtered or paginated URL ("/doctors?page=2") keeps its
 * English title, which carries the page number and so stays unique — replacing it with the base
 * title would give every page of a directory the same title.
 */
const PAGE_META_KEYS: Record<string, string> = {
  "/": "home",
  "/doctors": "doctors",
  "/hospitals": "hospitals",
  "/reviews": "reviews",
  "/contact": "contact",
  "/specialities": "specialities",
  "/treatments": "treatments",
  "/conditions": "conditions",
  "/cost": "cost",
  "/locations": "locations",
  "/faqs": "faqs",
  "/ask-a-question": "ask",
  "/insurance-eligibility": "insurance",
  "/no-cost-emi": "emi",
  "/emi-calculator": "emiCalc",
  "/surgery-cost-calculator": "costCalc",
  "/pregnancy-due-date-calculator": "due",
  "/about": "about",
  "/patient-help": "patientHelp",
  "/blog": "blog",
};

/**
 * Per-route <head> builder: unique title/description, self-referencing canonical, Open Graph +
 * Twitter tags (with a default share image), optional noindex and JSON-LD blocks.
 *
 *   head: ({ match }) => seo({ locale: match.context.locale, title: "...", description: "...", path: "/treatments/x", jsonLd: [...] })
 */
export function seo(opts: {
  title: string;
  description: string;
  /** Path (with any meaningful query string) of the canonical URL, e.g. "/doctors?page=2". */
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article" | "profile";
  jsonLd?: Record<string, unknown>[];
  /** Language this render is in. Routes pass `match.context.locale`; defaults to English. */
  locale?: Locale;
}) {
  const locale = opts.locale ?? DEFAULT_LOCALE;
  // The canonical must point at THIS language's URL. Pointing every translation at the English
  // one would tell search engines the translations are duplicates and get them dropped.
  const [barePath = "/", query = ""] = splitQuery(opts.path);
  const metaKey = locale !== DEFAULT_LOCALE && query === "" ? PAGE_META_KEYS[barePath] : undefined;
  const localised = (suffix: "title" | "desc") => {
    if (!metaKey) return undefined;
    const key = `meta.${metaKey}.${suffix}`;
    const value = translate(locale, key);
    return value === key ? undefined : value;
  };
  const title = localised("title") ?? opts.title;
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  const url = `${SITE.url}${absolutePath(localePath(barePath, locale))}${query}`;
  const image = opts.image?.startsWith("http") ? opts.image : `${SITE.url}${opts.image ?? "/og-default.png"}`;
  const rawDescription = localised("desc") ?? opts.description;
  const description = rawDescription.length > 300 ? `${rawDescription.slice(0, 297)}…` : rawDescription;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      ...(opts.noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: opts.type ?? "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE.name },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: localeInfo(locale).htmlLang.replace("-", "_") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [
      { rel: "canonical", href: url },
      // Every language version of this page, so search engines can serve the right one and don't
      // treat them as competing duplicates. x-default points at English.
      ...LOCALES.map((l) => ({
        rel: "alternate",
        hrefLang: l.code,
        href: `${SITE.url}${absolutePath(localePath(barePath, l.code))}${query}`,
      })),
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: `${SITE.url}${absolutePath(localePath(barePath, DEFAULT_LOCALE))}${query}`,
      },
    ],
    scripts: (opts.jsonLd ?? []).map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify({ "@context": "https://schema.org", ...data }),
    })),
  };
}

/** "" for the home page so we emit https://site rather than https://site/. */
function absolutePath(path: string) {
  return path === "/" ? "" : path;
}

function splitQuery(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i === -1 ? [path, ""] : [path.slice(0, i), path.slice(i)];
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path === "/" ? "" : it.path}`,
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const organizationLd = {
  "@type": "MedicalOrganization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/apple-touch-icon.png`,
  email: SITE.email,
  // telephone/contactPoint deliberately omitted while the phone number is still a placeholder
  // (see src/lib/site.ts) — structured data must not advertise a number that doesn't work.
  areaServed: "IN",
};
