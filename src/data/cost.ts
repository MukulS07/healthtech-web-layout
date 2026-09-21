/**
 * Treatment cost data for /cost and /cost/$slug.
 *
 * ⚠️ EVERY NUMBER IN HERE IS A PLACEHOLDER. The bands below were written to lay out the page —
 * they are NOT quotes, NOT market research, and NOT copied from anyone else's price list. They
 * are therefore hidden from patients: a cost band only renders when its entry is `verified` AND
 * `COSTS_PUBLISHED` (src/lib/site.ts) is true. Until then the pages show "estimate on request".
 *
 * To publish real figures:
 *   1. Replace the band for a treatment in TREATMENT_COSTS (or add a city override).
 *   2. Set `source` to where it came from ("quoted" = ranges your team collected from hospitals,
 *      "cghs" = published CGHS/PM-JAY scheme rate) and `updatedAt` to the date you checked it.
 *   3. Set `verified: true` on that entry, and flip COSTS_PUBLISHED once enough are done.
 * A page shows its source and date next to the number, so a patient can see what it is.
 */
import { SPECIALITIES, TREATMENTS } from "@/data/catalog";

export type CostSource = "placeholder" | "quoted" | "cghs";

export interface CostBand {
  /** Lower end, in rupees. */
  min: number;
  /** Upper end, in rupees. */
  max: number;
  source: CostSource;
  /** ISO date the figure was last checked. */
  updatedAt?: string;
  /** Only true entries are ever shown to patients (and only when COSTS_PUBLISHED). */
  verified: boolean;
  /** Optional per-city bands, keyed by city slug (see CITIES in src/lib/site.ts). */
  cities?: Record<string, { min: number; max: number }>;
}

/**
 * Placeholder bands per speciality, used for every treatment in that speciality that has no entry
 * of its own. Round, obviously-approximate numbers — they exist so the layout has something to
 * render in development, nothing more.
 */
const PLACEHOLDER_BY_SPECIALITY: Record<string, [number, number]> = {
  proctology: [30000, 90000],
  laparoscopy: [45000, 150000],
  "general-surgery": [30000, 120000],
  urology: [40000, 180000],
  gynaecology: [40000, 150000],
  orthopaedics: [80000, 350000],
  "spine-surgery": [150000, 500000],
  neurosurgery: [200000, 700000],
  ent: [30000, 120000],
  ophthalmology: [20000, 120000],
  "cardiac-surgery": [200000, 600000],
  "vascular-surgery": [80000, 300000],
  "plastic-cosmetic-surgery": [50000, 250000],
  "hair-transplant": [50000, 200000],
  "gastrointestinal-surgery": [100000, 400000],
  "bariatric-surgery": [200000, 450000],
  "surgical-oncology": [150000, 600000],
  "transplant-surgery": [500000, 2500000],
  "paediatric-surgery": [40000, 200000],
  "oral-maxillofacial-surgery": [30000, 150000],
  "ivf-fertility": [90000, 300000],
};

/**
 * Per-treatment overrides. Empty today: fill this in with real, sourced figures as they arrive,
 * one treatment at a time — a verified entry here starts showing as soon as COSTS_PUBLISHED is on.
 */
export const TREATMENT_COSTS: Record<string, CostBand> = {};

/** The band to use for a treatment, real if we have one, else the speciality placeholder. */
export function costFor(treatmentSlug: string): CostBand | null {
  const own = TREATMENT_COSTS[treatmentSlug];
  if (own) return own;
  const treatment = TREATMENTS.find((t) => t.slug === treatmentSlug);
  const band = treatment && PLACEHOLDER_BY_SPECIALITY[treatment.speciality];
  if (!band) return null;
  return { min: band[0], max: band[1], source: "placeholder", verified: false };
}

/** Band for a treatment in one city, if that city has its own figures. */
export function costForCity(treatmentSlug: string, citySlug: string): { min: number; max: number } | null {
  const band = costFor(treatmentSlug);
  return band?.cities?.[citySlug] ?? null;
}

/** "₹45,000" — rupees, no decimals, Indian digit grouping. */
export function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export const COST_SOURCE_LABELS: Record<CostSource, string> = {
  placeholder: "Placeholder — not a quote",
  quoted: "Range collected from hospitals we work with",
  cghs: "Published CGHS / PM-JAY scheme rate",
};

/** Treatments grouped by speciality, for the /cost index. */
export function costIndex() {
  return SPECIALITIES.map((s) => ({
    speciality: s,
    treatments: TREATMENTS.filter((t) => t.speciality === s.slug),
  })).filter((g) => g.treatments.length > 0);
}
