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
/**
 * Cities we offer as a filter. `lat`/`lng` are the city centre, used only to turn a browser
 * geolocation reading into the nearest city on the device — nothing is sent to a geocoding
 * service, so a patient's coordinates never leave their browser.
 *
 * Names must match the real `Doctor.location` / `Hospital.city` values, or have an entry in
 * CITY_LOCATION_ALIASES (src/lib/city-aliases.ts) — several cities are spelled differently in the
 * imported data ("Haora" for Howrah, "Bengaluru" for Bangalore), and a name that matches neither
 * silently returns zero results.
 */
export const CITIES = [
  { name: "Delhi NCR", slug: "delhi-ncr", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", slug: "mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bangalore", slug: "bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", slug: "hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", slug: "chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Pune", slug: "pune", lat: 18.5204, lng: 73.8567 },
  { name: "Kolkata", slug: "kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad", slug: "ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", slug: "jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", slug: "lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "Kochi", slug: "kochi", lat: 9.9312, lng: 76.2673 },
  { name: "Indore", slug: "indore", lat: 22.7196, lng: 75.8577 },
  { name: "Thane", slug: "thane", lat: 19.2183, lng: 72.9781 },
  { name: "Navi Mumbai", slug: "navi-mumbai", lat: 19.033, lng: 73.0297 },
  { name: "Nagpur", slug: "nagpur", lat: 21.1458, lng: 79.0882 },
  { name: "Bhopal", slug: "bhopal", lat: 23.2599, lng: 77.4126 },
  { name: "Agra", slug: "agra", lat: 27.1767, lng: 78.0081 },
  { name: "Chandigarh", slug: "chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Patna", slug: "patna", lat: 25.5941, lng: 85.1376 },
  { name: "Amritsar", slug: "amritsar", lat: 31.634, lng: 74.8723 },
  { name: "Ludhiana", slug: "ludhiana", lat: 30.901, lng: 75.8573 },
  { name: "Visakhapatnam", slug: "visakhapatnam", lat: 17.6868, lng: 83.2185 },
  { name: "Howrah", slug: "howrah", lat: 22.5958, lng: 88.2636 },
  { name: "Nashik", slug: "nashik", lat: 19.9975, lng: 73.7898 },
  { name: "Kanpur", slug: "kanpur", lat: 26.4499, lng: 80.3319 },
  { name: "Ranchi", slug: "ranchi", lat: 23.3441, lng: 85.3096 },
  { name: "Surat", slug: "surat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", slug: "vadodara", lat: 22.3072, lng: 73.1812 },
  { name: "Coimbatore", slug: "coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", slug: "madurai", lat: 9.9252, lng: 78.1198 },
  { name: "Tiruchirappalli", slug: "tiruchirappalli", lat: 10.7905, lng: 78.7047 },
  { name: "Thiruvananthapuram", slug: "thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
  { name: "Kozhikode", slug: "kozhikode", lat: 11.2588, lng: 75.7804 },
  { name: "Thrissur", slug: "thrissur", lat: 10.5276, lng: 76.2144 },
  { name: "Mysore", slug: "mysore", lat: 12.2958, lng: 76.6394 },
  { name: "Mangalore", slug: "mangalore", lat: 12.9141, lng: 74.856 },
  { name: "Hubli", slug: "hubli", lat: 15.3647, lng: 75.124 },
  { name: "Vijayawada", slug: "vijayawada", lat: 16.5062, lng: 80.648 },
  { name: "Guntur", slug: "guntur", lat: 16.3067, lng: 80.4365 },
  { name: "Warangal", slug: "warangal", lat: 17.9689, lng: 79.5941 },
  { name: "Raipur", slug: "raipur", lat: 21.2514, lng: 81.6296 },
  { name: "Bhubaneswar", slug: "bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { name: "Guwahati", slug: "guwahati", lat: 26.1445, lng: 91.7362 },
  { name: "Dehradun", slug: "dehradun", lat: 30.3165, lng: 78.0322 },
  { name: "Varanasi", slug: "varanasi", lat: 25.3176, lng: 82.9739 },
  { name: "Prayagraj", slug: "prayagraj", lat: 25.4358, lng: 81.8463 },
  { name: "Jodhpur", slug: "jodhpur", lat: 26.2389, lng: 73.0243 },
  { name: "Udaipur", slug: "udaipur", lat: 24.5854, lng: 73.7125 },
  { name: "Gwalior", slug: "gwalior", lat: 26.2183, lng: 78.1828 },
  { name: "Jabalpur", slug: "jabalpur", lat: 23.1815, lng: 79.9864 },
  { name: "Aurangabad", slug: "aurangabad", lat: 19.8762, lng: 75.3433 },
  { name: "Jamshedpur", slug: "jamshedpur", lat: 22.8046, lng: 86.2029 },
  { name: "Siliguri", slug: "siliguri", lat: 26.7271, lng: 88.3953 },
  { name: "Salem", slug: "salem", lat: 11.6643, lng: 78.146 },
] as const;

/**
 * The cities we lead with — the ones with the deepest coverage in the directory. Used for footer
 * and "also available in" link lists, and for the city × speciality pages in the sitemap, so
 * widening the picker above doesn't turn every page into a wall of city links or add hundreds of
 * thin, noindexed URLs to the sitemap. The full CITIES list still drives the picker, the site
 * search and every city dropdown a patient has to choose their own city from.
 */
export const TOP_CITIES = CITIES.slice(0, 12);

/** Great-circle distance in km, for picking the nearest city to a geolocation reading. */
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Nearest supported city to a coordinate, or null if it's further than `maxKm` from all of them
 * (someone abroad, or in a part of India we don't cover — better to say so than to drop them in a
 * city 800km away).
 */
export function nearestCity(lat: number, lng: number, maxKm = 150) {
  let best: { city: (typeof CITIES)[number]; km: number } | null = null;
  for (const city of CITIES) {
    const km = haversineKm(lat, lng, city.lat, city.lng);
    if (!best || km < best.km) best = { city, km };
  }
  return best && best.km <= maxKm ? best : null;
}

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

/**
 * Master switch for showing treatment cost bands on /cost and /cost/$slug.
 *
 * false until src/data/cost.ts holds real, sourced figures (its numbers are placeholders written
 * to lay the pages out). While false, cost pages explain what drives the price and invite an
 * estimate request instead of printing a number. Individual entries also carry their own
 * `verified` flag, so turning this on still only reveals the entries that have been checked.
 */
export const COSTS_PUBLISHED = false;

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
/**
 * True while none of the flag-dependent wording above is switched on. The translated strings
 * describe exactly that state ("our team will call you back shortly"), so they are only used while
 * this holds; once someone enables a promise, the English text built from the flags is shown
 * instead, rather than a translation that no longer matches what the site is promising.
 */
export const DEFAULT_WORDING = !FREE && !COORDINATOR && !SITE.callbackTime;
