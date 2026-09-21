import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { DEFAULT_LOCALE, localeFromPath, localePath, type Locale } from "./locales";
import { translate } from "./strings";
import type { TVars } from "./types";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/**
 * The active locale comes from the URL, not from state or a cookie, so a page always renders in
 * the language its address says — the same link opens the same language for everyone, and SSR and
 * the client can't disagree about it.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/**
 * `const t = useT()` then `t("nav.doctors")`, or `t("list.found", { n: 12 })` to fill `{n}`.
 * Missing keys fall back to English.
 */
export function useT() {
  const locale = useLocale();
  return useMemo(() => (key: string, vars?: TVars) => translate(locale, key, vars), [locale]);
}

/**
 * Translated name for a catalogue speciality. Only the short name is translated (it works as a
 * label, like a menu entry); descriptions and taglines stay English. Falls back to the English name
 * when there is no translation, and English readers always get the catalogue name unchanged.
 */
export function useSpecName() {
  const locale = useLocale();
  return useMemo(
    () => (slug: string, fallback: string) => {
      if (locale === DEFAULT_LOCALE) return fallback;
      const key = `spec.${slug}`;
      const value = translate(locale, key);
      return value === key ? fallback : value;
    },
    [locale],
  );
}

/**
 * The current path in each language, for the switcher and for hreflang. Uses the router's own
 * location so it stays correct after client-side navigation.
 */
export function useLocalisedPaths() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });
  return useMemo(() => {
    // The router strips its basepath from location.pathname, so re-derive the full path first.
    const search = href.slice(pathname.length) || "";
    const current = typeof window !== "undefined" ? window.location.pathname : pathname;
    const active = localeFromPath(current);
    const bare = active === DEFAULT_LOCALE ? pathname : pathname;
    return {
      active,
      search,
      pathFor: (locale: Locale) => `${localePath(bare, locale)}${search}`,
    };
  }, [pathname, href]);
}
