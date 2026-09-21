/**
 * Constants shared between the admin screens (which run in the browser) and the Mongoose models
 * (which must never reach it).
 *
 * ⚠️ This file must import nothing. It exists because importing a model file from a React
 * component — even for a single constant or type — pulls Mongoose, and with it the whole MongoDB
 * driver, into the client bundle. That bundle then throws while loading, React never hydrates, and
 * every dropdown, filter and menu on the site silently stops responding even though the
 * server-rendered HTML still looks fine. Put anything both sides need here instead.
 */

/** How many doctors may be pinned to one speciality + city combination. */
export const MAX_PINNED_DOCTORS = 20;

/** Where an admin-managed FAQ appears. See src/models/Faq.ts for what each one maps to. */
export type FaqPageType =
  | "general"
  | "speciality"
  | "condition"
  | "treatment"
  | "cost"
  | "city"
  | "doctor"
  | "hospital";

export const FAQ_PAGE_TYPES: FaqPageType[] = [
  "general",
  "speciality",
  "condition",
  "treatment",
  "cost",
  "city",
  "doctor",
  "hospital",
];

export const FAQ_PAGE_LABELS: Record<FaqPageType, string> = {
  general: "All FAQs page",
  speciality: "Speciality page",
  condition: "Condition page",
  treatment: "Treatment page",
  cost: "Cost page",
  city: "City page",
  doctor: "Doctor profile",
  hospital: "Hospital profile",
};

/** True for a 24-character hex string, i.e. something that could be a Mongo ObjectId. */
export function isObjectIdLike(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{24}$/i.test(value);
}
