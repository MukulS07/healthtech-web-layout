import { SPECIALITIES } from "./specialities";
import { CONDITIONS } from "./conditions";
import { TREATMENTS_A } from "./treatments-a";
import { TREATMENTS_B } from "./treatments-b";
import type { Condition, Faq, Speciality, Treatment } from "./types";

export type { Condition, Faq, Speciality, Treatment } from "./types";
export { SPECIALITIES, CONDITIONS };
export const TREATMENTS: Treatment[] = [...TREATMENTS_A, ...TREATMENTS_B];

const specialityBySlug = new Map(SPECIALITIES.map((s) => [s.slug, s]));
const conditionBySlug = new Map(CONDITIONS.map((c) => [c.slug, c]));
const treatmentBySlug = new Map(TREATMENTS.map((t) => [t.slug, t]));

/** Old URLs that existed before the catalog, kept working. */
const LEGACY_TREATMENT_SLUGS: Record<string, string> = {
  "piles-surgery": "laser-piles-surgery",
  "anal-fissure": "laser-fissure-surgery",
  "fistula-treatment": "laser-fistula-surgery",
  "pilonidal-sinus": "pilonidal-sinus-surgery",
  "rectal-prolapse": "rectopexy",
  "knee-replacement": "total-knee-replacement",
  "hip-replacement": "total-hip-replacement",
  "gallstone": "laparoscopic-cholecystectomy",
  "gallbladder-removal": "laparoscopic-cholecystectomy",
  "hernia-surgery": "laparoscopic-hernia-repair",
  "kidney-stone": "rirs",
  "cataract": "phaco-cataract-surgery",
};
const LEGACY_SPECIALITY_SLUGS: Record<string, string> = {
  orthopedics: "orthopaedics",
  gynecology: "gynaecology",
  "general-surgery-laparoscopy": "laparoscopy",
  aesthetics: "plastic-cosmetic-surgery",
  cosmetic: "plastic-cosmetic-surgery",
};

export function getSpeciality(slug: string): Speciality | undefined {
  return specialityBySlug.get(slug) ?? specialityBySlug.get(LEGACY_SPECIALITY_SLUGS[slug] ?? "");
}
export function getCondition(slug: string): Condition | undefined {
  return conditionBySlug.get(slug);
}
export function getTreatment(slug: string): Treatment | undefined {
  return treatmentBySlug.get(slug) ?? treatmentBySlug.get(LEGACY_TREATMENT_SLUGS[slug] ?? "");
}
/** The canonical slug for a (possibly legacy) slug, or undefined if unknown. */
export function canonicalTreatmentSlug(slug: string) {
  return getTreatment(slug)?.slug;
}
export function canonicalSpecialitySlug(slug: string) {
  return getSpeciality(slug)?.slug;
}

export function treatmentsForSpeciality(slug: string) {
  return TREATMENTS.filter((t) => t.speciality === slug);
}
export function conditionsForSpeciality(slug: string) {
  return CONDITIONS.filter((c) => c.speciality === slug);
}
export function treatmentsForCondition(c: Condition) {
  return c.treatments.map((s) => treatmentBySlug.get(s)).filter((t): t is Treatment => Boolean(t));
}
export function conditionsForTreatment(t: Treatment) {
  const listed = (t.conditions ?? []).map((s) => conditionBySlug.get(s));
  const reverse = CONDITIONS.filter((c) => c.treatments.includes(t.slug));
  const all = [...listed, ...reverse].filter((c): c is Condition => Boolean(c));
  return [...new Map(all.map((c) => [c.slug, c])).values()];
}

/** Case-insensitive regex source matching Doctor.specialization for ANY surgical speciality. */
export const SURGICAL_DOCTOR_MATCH = SPECIALITIES.map((s) => `(?:${s.doctorMatch})`).join("|");

/**
 * Non-clinical junk that appears in the scraped specialization/name data even when a surgical
 * keyword matches (e.g. "Cancer treatment center", "Orthopedic clinic"). Excluded everywhere.
 */
export const NON_PERSON_NAME_PATTERN =
  "hospital|clinic|foundation|centre|center|pharmacy|society|trust|pvt|ltd|diagnostic|nursing home|medical store|charity|office";

const INSURANCE_ANSWER: Record<Treatment["insurance"], string> = {
  usually:
    "It is usually covered by health insurance when medically necessary, subject to your policy's terms, waiting periods and sub-limits. Our insurance desk can check your specific policy.",
  "case-by-case":
    "Coverage depends on why it is being done and on your policy — it is often covered when medically necessary. Our insurance desk can check your specific policy.",
  rarely:
    "It is usually not covered by health insurance, because it is typically elective. Some policies have exceptions — our team can check yours.",
};

/** FAQs generated only from the treatment's own fields — no invented facts. */
export function treatmentFaqs(t: Treatment): Faq[] {
  return [
    { q: `How long does ${t.name} take?`, a: `${t.duration}. The exact time depends on your case.` },
    { q: `Will I need to stay in hospital?`, a: `Typical hospital stay: ${t.stay}.` },
    { q: `What anaesthesia is used?`, a: `${t.anaesthesia}. Your anaesthetist will confirm the plan for you.` },
    { q: `How long is recovery after ${t.name}?`, a: t.recovery },
    { q: `Is ${t.name} covered by insurance?`, a: INSURANCE_ANSWER[t.insurance] },
  ];
}

export function conditionFaqs(c: Condition): Faq[] {
  const tx = treatmentsForCondition(c).map((t) => t.name);
  return [
    { q: `What are the common symptoms of ${c.name}?`, a: `${c.symptoms.slice(0, 4).join("; ")}.` },
    { q: `What causes ${c.name}?`, a: `${c.causes.join("; ")}.` },
    { q: `How is ${c.name} diagnosed?`, a: `${c.diagnosis.join("; ")}.` },
    ...(tx.length
      ? [{ q: `What are the treatment options?`, a: `Depending on severity, options include ${tx.join(", ")}. A specialist will recommend what suits you after examination.` }]
      : []),
    { q: `When should I see a doctor?`, a: c.whenToSee },
  ];
}

/** Generic booking FAQs appended to speciality pages (true of the service, not of outcomes). */
export const BOOKING_FAQS: Faq[] = [
  {
    q: "How do I book a consultation?",
    a: "Fill in the short form on this page with your name, phone number, condition and city. A care coordinator will call you back to understand your needs and arrange a consultation — no account is needed.",
  },
  {
    q: "Does Go Surgery help with insurance and EMI?",
    a: "Yes. Our team can check your policy for cashless eligibility and explain no-cost EMI options where available before you decide.",
  },
];
