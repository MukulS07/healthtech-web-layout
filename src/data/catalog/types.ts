/**
 * Curated care catalog — the site's own taxonomy of specialities, conditions and treatments.
 *
 * Content rules (see CLAUDE.md "IP boundary" + the fabrication rule):
 * - Original, general medical information only — no copied text from any other site.
 * - No invented business facts: no prices, success rates, patient counts, named doctors or
 *   hospitals. Numbers that appear here are clinical norms (e.g. typical hospital stay), phrased
 *   as typical ranges, not promises.
 * - This is patient education, not medical advice; pages render a disclaimer to that effect.
 */

export type InsuranceCover = "usually" | "case-by-case" | "rarely";

/**
 * Set only when a real, named clinician has actually reviewed the page. Until then pages show
 * "Pending medical review" (see ContentReviewNote) — never fill this in speculatively.
 */
export interface ClinicalReview {
  name: string;
  credentials: string;
  /** ISO date of the review. */
  date: string;
  /** Doctor profile slug, if they're in our directory. */
  profileSlug?: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Speciality {
  slug: string;
  reviewedBy?: ClinicalReview;
  name: string;
  /** One line under the H1. */
  tagline: string;
  /** Always-visible intro paragraph. */
  intro: string;
  /** Extra paragraphs behind "Read more". */
  more: string[];
  /** Case-insensitive regex source matched against Doctor.specialization to find real doctors. */
  doctorMatch: string;
  /** Speciality-specific FAQs (generic booking/insurance FAQs are appended by the page). */
  faqs: Faq[];
}

export interface Condition {
  slug: string;
  reviewedBy?: ClinicalReview;
  name: string;
  aka?: string[];
  speciality: string;
  summary: string;
  symptoms: string[];
  causes: string[];
  diagnosis: string[];
  /** Treatment slugs, most common first. */
  treatments: string[];
  selfCare?: string[];
  /** When to see a doctor promptly. */
  whenToSee: string;
}

export interface Treatment {
  slug: string;
  reviewedBy?: ClinicalReview;
  name: string;
  aka?: string[];
  speciality: string;
  summary: string;
  /** Who it's typically for. */
  indications: string[];
  /** What happens, in order. */
  steps: string[];
  anaesthesia: string;
  /** Typical operating time. */
  duration: string;
  /** Typical hospital stay. */
  stay: string;
  recovery: string;
  risks: string[];
  insurance: InsuranceCover;
  /** Condition slugs this treats. */
  conditions?: string[];
}
