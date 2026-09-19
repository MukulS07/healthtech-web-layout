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
  /** The one response-time promise used everywhere (was inconsistently 45 min / 30 min). */
  callbackTime: "30 minutes",
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
  { key: "coordinator", title: "Dedicated care coordinator", sub: "One person who guides you from first call to recovery", enabled: true },
  { key: "free-consult", title: "Free first consultation", sub: "Understand your options before you decide", enabled: true },
  { key: "insurance", title: "Insurance paperwork help", sub: "We check your policy and help with pre-authorisation", enabled: true },
  { key: "emi", title: "No-cost EMI options", sub: "Where available through our lending partners", enabled: true },
  { key: "cab", title: "Free cab on surgery day", sub: "Pick-up and drop for the procedure", enabled: false },
  { key: "follow-up", title: "Free follow-up consultation", sub: "A post-surgery review with your surgeon", enabled: false },
  { key: "support-24x7", title: "24×7 patient support", sub: "Someone to call at any hour", enabled: false },
  { key: "no-hidden", title: "No hidden charges", sub: "A written estimate before admission", enabled: false },
] as const;

export const ENABLED_PROMISES = SERVICE_PROMISES.filter((p) => p.enabled);
