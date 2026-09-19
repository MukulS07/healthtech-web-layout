/**
 * Single source of truth for brand/contact details shown across the site.
 *
 * ⚠️ PLACEHOLDERS: `phone` and `whatsapp` below are still the original placeholder values (the
 * real numbers haven't been provided yet). Every "Call"/WhatsApp CTA on the site reads from here,
 * so replacing these two values fixes all of them at once. Don't hardcode numbers in components.
 */
export const SITE = {
  name: "Go Surgery",
  /** Canonical origin used for canonical URLs, sitemap and Open Graph tags. */
  url: (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/$/, "") ||
    "https://healthtech-web-layout.vercel.app",
  phone: { display: "1800 000 1234", tel: "18000001234" }, // PLACEHOLDER
  whatsapp: { display: "+91 98765 43210", number: "919876543210" }, // PLACEHOLDER
  email: "care@gosurgery.in",
  /**
   * Response-time promise (e.g. "30 minutes"). `null` until the business confirms a time it can
   * actually meet — copy then says "shortly" instead of a number. See `callbackPhrase`.
   */
  callbackTime: null as string | null,
} as const;

export const telHref = `tel:${SITE.phone.tel}`;

/** wa.me deep link with an optional pre-filled message. */
export function whatsappHref(message = "Hi, I'd like to know more about a surgery consultation.") {
  return `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/** Cities we have city pages for (slug matches /locations/$city). */
export const CITIES = [
  { name: "Delhi NCR", slug: "delhi-ncr" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Chennai", slug: "chennai" },
  { name: "Pune", slug: "pune" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Ahmedabad", slug: "ahmedabad" },
  { name: "Jaipur", slug: "jaipur" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Kochi", slug: "kochi" },
  { name: "Indore", slug: "indore" },
] as const;

/**
 * What patients get. ⚠️ Only entries with `enabled: true` are shown anywhere on the site.
 * The disabled ones are operational promises (free cab, free follow-ups, 24×7 support, "no
 * hidden charges") that must only be advertised once the business actually delivers them —
 * advertising an undelivered service is a misleading-advertisement risk (CCPA / ASCI).
 * Flip `enabled` to true for each one that is genuinely offered.
 */
export const SERVICE_PROMISES = [
  { key: "coordinator", title: "Dedicated care coordinator", sub: "One person who guides you from first call to recovery", enabled: false },
  { key: "free-consult", title: "Free first consultation", sub: "Understand your options before you decide", enabled: false },
  { key: "insurance", title: "Insurance paperwork help", sub: "We check your policy and help with pre-authorisation", enabled: false },
  { key: "emi", title: "No-cost EMI options", sub: "Where available through our lending partners", enabled: false },
  { key: "cab", title: "Free cab on surgery day", sub: "Pick-up and drop for the procedure", enabled: false },
  { key: "follow-up", title: "Free follow-up consultation", sub: "A post-surgery review with your surgeon", enabled: false },
  { key: "support-24x7", title: "24×7 patient support", sub: "Someone to call at any hour", enabled: false },
  { key: "no-hidden", title: "No hidden charges", sub: "A written estimate before admission", enabled: false },
] as const;

export const ENABLED_PROMISES = SERVICE_PROMISES.filter((p) => p.enabled);

type PromiseKey = (typeof SERVICE_PROMISES)[number]["key"];
export const promiseEnabled = (key: PromiseKey) => SERVICE_PROMISES.some((p) => p.key === key && p.enabled);

/*
 * Copy that depends on the promises above. Components use these instead of hardcoding "free" /
 * "care coordinator" / "within 30 minutes", so flipping a flag (or setting SITE.callbackTime)
 * updates every page at once.
 */
const FREE = promiseEnabled("free-consult");
const COORDINATOR = promiseEnabled("coordinator");
/** Button label, e.g. "Book Free Consultation" / "Book a Consultation". */
export const BOOK_LABEL = FREE ? "Book Free Consultation" : "Book a Consultation";
/** Short button label for tight spaces (doctor cards). */
export const BOOK_LABEL_SHORT = FREE ? "Book Free Consult" : "Book Consult";
/** "a free consultation" / "a consultation" — for running text. */
export const CONSULT_PHRASE = FREE ? "a free consultation" : "a consultation";
/** "a care coordinator" / "our team" — who calls the patient back. */
export const CALLER = COORDINATOR ? "a care coordinator" : "our team";
/** "within 30 minutes" / "shortly". */
export const CALLBACK_PHRASE = SITE.callbackTime ? `within ${SITE.callbackTime}` : "shortly";
/** Capitalise the first letter (for CALLER at the start of a sentence). */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
