import { trackClickFn } from "@/lib/server-functions/analytics";
import { localeFromPath } from "@/lib/i18n/locales";

const VISITOR_KEY = "gs_visitor";

/**
 * A random id for this browser, used only so the admin reports can say "40 clicks from 12
 * visitors" instead of just "40 clicks". It is not derived from anything about the person, is
 * never sent anywhere except our own server, and clearing site data starts a new one. If storage
 * is unavailable (private window, blocked cookies) we simply don't send one.
 */
function visitorId(): string | undefined {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return undefined;
  }
}

export type TrackTarget = {
  type: "call" | "whatsapp" | "profile_click" | "directions" | "enquiry";
  targetType?: "doctor" | "hospital" | "site";
  targetId?: string;
  targetName?: string;
  targetPhone?: string;
  city?: string;
  speciality?: string;
};

/**
 * Records an interaction without getting in the patient's way.
 *
 * Deliberately fire-and-forget: the click that triggers this is usually a `tel:` link or an
 * outbound WhatsApp link, and the browser is already navigating away. We never await it and never
 * let a failure surface — a broken analytics write must not stop someone phoning a surgeon.
 */
export function track(event: TrackTarget): void {
  if (typeof window === "undefined") return;
  try {
    const id = visitorId();
    void trackClickFn({
      data: {
        ...event,
        sourcePage: window.location.pathname,
        locale: localeFromPath(window.location.pathname),
        ...(id ? { visitorId: id } : {}),
      },
    }).catch(() => {
      /* tracking is best-effort */
    });
  } catch {
    /* tracking is best-effort */
  }
}
