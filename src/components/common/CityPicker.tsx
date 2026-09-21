import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LocateFixed, MapPin, Search, X } from "lucide-react";
import { CITIES, nearestCity } from "@/lib/site";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type LocateState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "error"; message: string };

/**
 * City selector: type to filter, or let the browser work it out.
 *
 * "Use my location" resolves the reading against the city coordinates in CITIES **on the device** —
 * there is no reverse-geocoding request, so the patient's coordinates never leave their browser and
 * we need no third-party key. If they're more than ~150km from every city we cover we say so rather
 * than silently dropping them in the wrong one.
 */
export function CityPicker({
  city,
  onChange,
  className,
  align = "start",
}: {
  city: string;
  onChange: (value: string) => void;
  className?: string;
  align?: "start" | "end";
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locate, setLocate] = useState<LocateState>({ status: "idle" });
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else {
      setQuery("");
      setLocate({ status: "idle" });
    }
  }, [open]);

  const term = query.trim().toLowerCase();
  const matches = useMemo(
    () => (term ? CITIES.filter((c) => c.name.toLowerCase().includes(term)) : CITIES),
    [term],
  );

  const choose = (value: string) => {
    onChange(value);
    setOpen(false);
  };

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocate({ status: "error", message: t("city.unsupported") });
      return;
    }
    setLocate({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (!found) {
          setLocate({
            status: "error",
            message: t("city.notCovered"),
          });
          return;
        }
        choose(found.city.name);
      },
      (err) => {
        setLocate({
          status: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? t("city.blocked")
              : t("city.failed"),
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 w-full items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-semibold text-navy transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <MapPin className="h-4 w-4 shrink-0 text-brand-orange" />
        <span className={cn("truncate", !city && "font-medium text-muted-foreground")}>
          {city || t("city.select")}
        </span>
        <ChevronDown className={cn("ml-auto h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-background p-2 shadow-xl",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div className="flex items-center gap-2 rounded-lg border border-border bg-cream px-2.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-brand-orange" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("city.searchCity")}
              aria-label={t("city.searchCityLabel")}
              className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="shrink-0">
                <X className="h-4 w-4 text-muted-foreground hover:text-navy" />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            disabled={locate.status === "locating"}
            className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-cream disabled:opacity-60"
          >
            <LocateFixed className={cn("h-4 w-4 shrink-0", locate.status === "locating" && "animate-pulse")} />
            {locate.status === "locating" ? t("city.finding") : t("city.getMyLocation")}
          </button>
          {locate.status === "error" ? (
            <p className="px-2.5 pb-1 text-xs leading-relaxed text-muted-foreground">{locate.message}</p>
          ) : null}

          <ul role="listbox" aria-label={t("city.cities")} className="mt-1 max-h-64 overflow-y-auto">
            {city ? (
              <li>
                <button
                  type="button"
                  onClick={() => choose("")}
                  className="flex min-h-11 w-full items-center rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-cream"
                >
                  {t("city.allCities")}
                </button>
              </li>
            ) : null}
            {matches.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.name === city}
                  onClick={() => choose(c.name)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-cream",
                    c.name === city ? "font-semibold text-primary" : "text-navy",
                  )}
                >
                  {c.name}
                  {c.name === city ? <Check className="ml-auto h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            ))}
            {matches.length === 0 ? (
              <li className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                {t("city.noMatch")} “{query}”.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
