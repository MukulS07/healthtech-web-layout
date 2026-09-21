import { connectToDatabase } from "@/lib/db";
import { Doctor } from "@/models/Doctor";
import { Hospital } from "@/models/Hospital";
import { CONDITIONS, SPECIALITIES, SURGICAL_DOCTOR_MATCH, TREATMENTS } from "@/data/catalog";
import { BLOG_POSTS } from "@/data/blog";
import { CITIES, SITE } from "@/lib/site";

type Url = { loc: string; lastmod?: string; priority?: number };

const today = () => new Date().toISOString().slice(0, 10);
const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function xmlResponse(body: string) {
  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=86400" },
  });
}

export function urlset(urls: Url[]) {
  const items = urls
    .map(
      (u) =>
        `<url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}${
          u.priority != null ? `<priority>${u.priority.toFixed(1)}</priority>` : ""
        }</url>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}

export function sitemapIndex(children: string[]) {
  const items = children.map((c) => `<sitemap><loc>${SITE.url}${c}</loc><lastmod>${today()}</lastmod></sitemap>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}

const STATIC_PATHS = [
  ["/", 1.0],
  ["/specialities", 0.9],
  ["/treatments", 0.9],
  ["/conditions", 0.9],
  ["/doctors", 0.9],
  ["/hospitals", 0.8],
  ["/locations", 0.7],
  ["/contact", 0.8],
  ["/blog", 0.7],
  ["/reviews", 0.6],
  ["/cost", 0.6],
  ["/insurance-eligibility", 0.6],
  ["/no-cost-emi", 0.6],
  ["/emi-calculator", 0.6],
  ["/surgery-cost-calculator", 0.7],
  ["/ask-a-question", 0.5],
  ["/about", 0.5],
  ["/faqs", 0.5],
  ["/careers", 0.4],
  ["/doctor-onboarding", 0.4],
  ["/patient-help", 0.4],
  ["/pregnancy-due-date-calculator", 0.4],
  ["/editorial-policy", 0.3],
  ["/privacy", 0.2],
  ["/terms", 0.2],
] as const;

/** Every catalog/editorial page: specialities, city × speciality, treatments, conditions, blog, cities. */
export function pageUrls(): Url[] {
  const d = today();
  return [
    ...STATIC_PATHS.map(([p, priority]) => ({ loc: `${SITE.url}${p === "/" ? "" : p}`, lastmod: d, priority })),
    ...SPECIALITIES.map((s) => ({ loc: `${SITE.url}/specialities/${s.slug}`, lastmod: d, priority: 0.9 })),
    ...SPECIALITIES.flatMap((s) => CITIES.map((c) => ({ loc: `${SITE.url}/specialities/${s.slug}/${c.slug}`, lastmod: d, priority: 0.8 }))),
    ...TREATMENTS.map((t) => ({ loc: `${SITE.url}/treatments/${t.slug}`, lastmod: d, priority: 0.8 })),
    ...CONDITIONS.map((c) => ({ loc: `${SITE.url}/conditions/${c.slug}`, lastmod: d, priority: 0.8 })),
    ...TREATMENTS.map((t) => ({ loc: `${SITE.url}/cost/${t.slug}`, lastmod: d, priority: 0.6 })),
    ...BLOG_POSTS.map((p) => ({ loc: `${SITE.url}/blog/${p.slug}`, lastmod: p.updated ?? p.published, priority: 0.6 })),
    ...CITIES.map((c) => ({ loc: `${SITE.url}/locations/${c.slug}`, lastmod: d, priority: 0.7 })),
  ];
}

/**
 * Doctor profiles worth indexing: surgical specialities only, and only doctors with at least one
 * patient review (thin, review-less profiles would dilute the site rather than help it).
 */
export async function doctorUrls(limit = 45000): Promise<Url[]> {
  await connectToDatabase();
  const docs = await Doctor.find({
    isActive: { $ne: false },
    slug: { $exists: true, $ne: "" },
    specialization: { $regex: SURGICAL_DOCTOR_MATCH, $options: "i" },
    "rating.count": { $gt: 0 },
  })
    .select("slug updatedAt")
    .sort({ "rating.count": -1 })
    .limit(limit)
    .lean<{ slug: string; updatedAt?: Date }[]>();
  return docs.map((d) => ({
    loc: `${SITE.url}/doctors/${encodeURIComponent(d.slug)}`,
    ...(d.updatedAt ? { lastmod: new Date(d.updatedAt).toISOString().slice(0, 10) } : {}),
    priority: 0.6,
  }));
}

/** Hospitals with at least one listed doctor, largest first. */
export async function hospitalUrls(limit = 45000): Promise<Url[]> {
  await connectToDatabase();
  const docs = await Hospital.find({ isActive: { $ne: false }, slug: { $exists: true, $ne: "" }, totalDoctors: { $gt: 0 } })
    .select("slug updatedAt")
    .sort({ totalDoctors: -1 })
    .limit(limit)
    // Sorting 34k documents by totalDoctors exceeded Mongo's 32MB in-memory sort limit, which threw
    // and left this sitemap empty (every hospital page invisible to search engines). See the
    // matching indexes in src/models/Hospital.ts.
    .allowDiskUse(true)
    .lean<{ slug: string; updatedAt?: Date }[]>();
  return docs.map((h) => ({
    loc: `${SITE.url}/hospitals/${encodeURIComponent(h.slug)}`,
    ...(h.updatedAt ? { lastmod: new Date(h.updatedAt).toISOString().slice(0, 10) } : {}),
    priority: 0.5,
  }));
}
