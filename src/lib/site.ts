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
