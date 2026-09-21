import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n/context";
import { LOCALES, localeInfo, localePath, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

/**
 * Switches language by going to the same page under the other language's prefix, so the address
 * bar always matches what's on screen and the choice can be bookmarked or shared. A plain <a> on
 * purpose — it's a full navigation, and it has to work before hydration.
 *
 * Each option is labelled in its own script (हिन्दी, தமிழ்), since someone who needs the Tamil
 * version can't necessarily read the word "Tamil".
 */
export function LanguagePicker({ className, align = "end" }: { className?: string; align?: "start" | "end" }) {
  const locale = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("/");
  const ref = useRef<HTMLDivElement>(null);

  // Read the real browser path (the router strips the locale prefix from its own location).
  useEffect(() => {
    setPath(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hrefFor = (target: Locale) => {
    const [bare = "/", suffix = ""] = splitSuffix(path);
    return `${localePath(bare, target)}${suffix}`;
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("common.chooseLanguage")}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-semibold text-navy transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Languages className="h-4 w-4 shrink-0 text-brand-orange" />
        <span className="truncate">{localeInfo(locale).endonym}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <ul
          role="menu"
          aria-label={t("common.language")}
          className={cn(
            "absolute top-full z-50 mt-2 w-56 rounded-xl border border-border bg-background p-2 shadow-xl",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {LOCALES.map((l) => (
            <li key={l.code} role="none">
              <a
                role="menuitem"
                href={hrefFor(l.code)}
                hrefLang={l.code}
                aria-current={l.code === locale ? "true" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-cream",
                  l.code === locale ? "font-semibold text-primary" : "text-navy",
                )}
              >
                <span className="truncate">{l.endonym}</span>
                <span className="truncate text-xs text-muted-foreground">{l.label}</span>
                {l.code === locale ? <Check className="ml-auto h-4 w-4 shrink-0" /> : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function splitSuffix(href: string): [string, string] {
  const i = href.search(/[?#]/);
  return i === -1 ? [href, ""] : [href.slice(0, i), href.slice(i)];
}
