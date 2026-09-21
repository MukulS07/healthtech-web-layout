import { DEFAULT_LOCALE, type Locale } from "./locales";
import en from "./dict/en";
import type { Dict, TVars } from "./types";

/**
 * Interface strings only — navigation, buttons, form labels, headings, short marketing lines.
 *
 * ⚠️ Deliberately NOT here: treatment, condition and speciality copy, blog articles and the legal
 * pages. That is medical and legal text, and machine-translating it would put unreviewed clinical
 * claims in front of patients in six languages. Those pages stay in English until a clinician who
 * reads the language has signed them off (see `reviewedBy` in src/data/catalog/types.ts).
 *
 * ⚠️ These translations have NOT been checked by native speakers. They're good enough to ship a
 * navigable interface, but get each language reviewed before you promote it — a wrong word in a
 * booking form costs a patient a real appointment.
 *
 * Anything missing from a language falls back to English rather than rendering blank, so a partial
 * translation is always safe to add.
 *
 * How the dictionaries load: English is bundled (it's the fallback). Every other language is its
 * own file under ./dict and is fetched with a dynamic import by `loadDictionary()`, which
 * `getRouter()` awaits before the app renders — on the server and in the browser alike, so the two
 * always agree and no visitor downloads a language they aren't reading. The registry below is keyed
 * by locale and only ever holds immutable dictionaries, so sharing it across server requests can't
 * leak one visitor's language into another's.
 */
const REGISTRY: Partial<Record<Locale, Dict>> = { en };

const LOADERS: Record<Exclude<Locale, "en">, () => Promise<{ default: Dict }>> = {
  hi: () => import("./dict/hi"),
  ta: () => import("./dict/ta"),
  te: () => import("./dict/te"),
  ml: () => import("./dict/ml"),
  kn: () => import("./dict/kn"),
  mr: () => import("./dict/mr"),
};

/** Makes sure a locale's dictionary is in the registry. Safe to call repeatedly. */
export async function loadDictionary(locale: Locale): Promise<void> {
  if (locale === DEFAULT_LOCALE || REGISTRY[locale]) return;
  const load = LOADERS[locale as Exclude<Locale, "en">];
  if (!load) return;
  try {
    REGISTRY[locale] = (await load()).default;
  } catch {
    // A failed chunk must never take the page down — English fallback is always available.
  }
}

function fill(text: string, vars?: TVars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** Looks up a key, falling back to English and then to the key itself — never renders blank. */
export function translate(locale: Locale, key: string, vars?: TVars): string {
  return fill(REGISTRY[locale]?.[key] ?? en[key] ?? key, vars);
}

/** How much of the interface a language actually covers, for spotting gaps. */
export function coverage(locale: Locale): number {
  const total = Object.keys(en).length;
  const have = Object.keys(REGISTRY[locale] ?? {}).length;
  return total === 0 ? 1 : have / total;
}

export type { Dict, TVars };
