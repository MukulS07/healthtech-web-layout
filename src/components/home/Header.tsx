import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  HeartPulse,
  Loader2,
  MapPin,
  Menu,
  Phone,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Container, OrangeButton } from "./primitives";
import { CONDITIONS, SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { BOOK_LABEL, CITIES, SITE, telHref } from "@/lib/site";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { CityPicker } from "@/components/common/CityPicker";
import { LanguagePicker } from "@/components/common/LanguagePicker";
import { useLocale, useT } from "@/lib/i18n/context";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { A } from "@/components/common/A";

const CITY_KEY = "gs-city";

const MENUS = {
  "For Patients": [
    { label: BOOK_LABEL, href: "/contact" },
    { label: "Find a Doctor", href: "/doctors" },
    { label: "Find a Hospital", href: "/hospitals" },
    { label: "Specialities", href: "/specialities" },
    { label: "Treatments", href: "/treatments" },
    { label: "Conditions", href: "/conditions" },
    { label: "Surgery Cost", href: "/cost" },
    { label: "Insurance Eligibility", href: "/insurance-eligibility" },
    { label: "No-Cost EMI", href: "/no-cost-emi" },
    { label: "Ask a Question", href: "/ask-a-question" },
    { label: "Patient Reviews", href: "/reviews" },
    { label: "Write a Review", href: "/reviews/write" },
    { label: "Health Articles", href: "/blog" },
    { label: "Surgery Cost Calculator", href: "/surgery-cost-calculator" },
      { label: "EMI Calculator", href: "/emi-calculator" },
      { label: "Pregnancy Due Date Calculator", href: "/pregnancy-due-date-calculator" },
    { label: "Patient Help", href: "/patient-help" },
    { label: "FAQs", href: "/faqs" },
  ],
  "Our Company": [
    { label: "About Us", href: "/about" },
    { label: "Locations", href: "/locations" },
    { label: "Careers", href: "/careers" },
    { label: "Partner With Us (Doctors)", href: "/doctor-onboarding" },
    { label: "Contact Us", href: "/contact" },
    { label: "Editorial Policy", href: "/editorial-policy" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
} as const;

type Suggestion = { kind: string; label: string; href: string; sub?: string };

function catalogSuggestions(term: string): Suggestion[] {
  const t = term.toLowerCase();
  const hit = (s: string) => s.toLowerCase().includes(t);
  return [
    ...SPECIALITIES.filter((s) => hit(s.name)).map((s) => ({ kind: "Speciality", label: s.name, href: `/specialities/${s.slug}` })),
    ...CONDITIONS.filter((c) => hit(c.name) || (c.aka ?? []).some(hit)).map((c) => ({ kind: "Condition", label: c.name, href: `/conditions/${c.slug}` })),
    ...TREATMENTS.filter((x) => hit(x.name) || (x.aka ?? []).some(hit)).map((x) => ({ kind: "Treatment", label: x.name, href: `/treatments/${x.slug}` })),
    ...CITIES.filter((c) => hit(c.name)).map((c) => ({ kind: "City", label: c.name, href: `/locations/${c.slug}` })),
  ].slice(0, 8);
}

function GlobalSearch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const gt = useT();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const term = q.trim();
  const catalog = useMemo(() => (term.length >= 2 ? catalogSuggestions(term) : []), [term]);

  useEffect(() => {
    if (term.length < 3) {
      setDoctors([]);
      return;
    }
    let live = true;
    setLoading(true);
    const t = setTimeout(() => {
      getDoctorsFn({ data: { query: term, limit: 4 } })
        .then((res) => {
          if (!live || !res.success) return;
          setDoctors(
            res.doctors.map((d) => ({
              kind: "Doctor",
              label: d.name,
              href: `/doctors/${d.slug}`,
              sub: [d.specialty, d.city].filter(Boolean).join(" · "),
            })),
          );
        })
        .finally(() => live && setLoading(false));
    }, 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [term]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const results = [...catalog, ...doctors];
  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    window.location.href = href;
  };

  return (
    <div ref={box} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const pick = results[active] ?? results[0];
          if (pick) go(pick.href);
          else if (term) go(`/doctors?q=${encodeURIComponent(term)}`);
        }}
        className="flex items-center gap-2 rounded-lg border border-border/40 bg-brand-orange-soft/60 px-3.5 py-2 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      >
        <Search className="h-4 w-4 shrink-0 text-primary" />
        <input
          aria-label={gt("search.label")}
          role="combobox"
          aria-expanded={open && results.length > 0}
          autoComplete="off"
          className="w-full min-w-0 truncate bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground/80"
          placeholder={gt("search.placeholder")}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : null}
      </form>
      {open && term.length >= 2 ? (
        <ul role="listbox" className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-auto rounded-lg border border-border bg-background p-1 shadow-xl">
          {results.map((r, i) => (
            <li key={r.kind + r.href} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r.href)}
                className={cn("flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm", i === active ? "bg-cream" : "hover:bg-cream")}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-navy">{r.label}</span>
                  {r.sub ? <span className="block truncate text-xs text-muted-foreground">{r.sub}</span> : null}
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{r.kind}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(`/doctors?q=${encodeURIComponent(term)}`)}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-cream"
            >
              Search doctors for “{term}” →
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function useCity() {
  const [city, setCity] = useState("");
  useEffect(() => {
    try {
      setCity(localStorage.getItem(CITY_KEY) ?? "");
    } catch {
      /* storage unavailable */
    }
  }, []);
  const update = (value: string) => {
    setCity(value);
    try {
      if (value) localStorage.setItem(CITY_KEY, value);
      else localStorage.removeItem(CITY_KEY);
    } catch {
      /* ignore */
    }
  };
  return [city, update] as const;
}

function Dropdown({ label, items }: { label: string; items: readonly { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="flex min-w-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 pt-2">
          <ul className={cn("grid gap-0.5 rounded-xl border border-border bg-background p-2 shadow-xl", items.length > 8 ? "w-[30rem] grid-cols-2" : "w-60")}>
            {items.map((it) => (
              <li key={it.href + it.label}>
                <A href={it.href} className="block rounded-md px-3 py-2 text-sm text-navy hover:bg-cream">
                  {it.label}
                </A>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const t = useT();
  const locale = useLocale();
  // Indian-script nav labels run roughly twice the width of the English ones ("For Patients" vs
  // "രോഗികൾക്കായി", and "My Appointments" becomes എന്റെ അപ്പോയിന്റ്മെന്റുകൾ). Measured at 1536 the
  // inline nav still overlapped the city picker by 135px and crushed the search to 30px, so
  // deferring a breakpoint is not enough — translated locales use the compact header and menu at
  // every width. Nothing is lost: the menu holds the same search, city picker and nav links.
  // English keeps the inline desktop header exactly as before.
  const bp = locale === DEFAULT_LOCALE
    ? { nav: "xl:flex", show: "xl:block", hide: "xl:hidden" }
    : { nav: "hidden", show: "hidden", hide: "" };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [city, setCity] = useCity();
  const q = city ? `?city=${encodeURIComponent(city)}` : "";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="text-navy">
        <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between">
          <div className="flex min-w-0 items-center gap-4 lg:flex-1 lg:gap-5">
            <A href="/" className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </span>
              <span className="truncate text-lg font-bold tracking-tight">{SITE.name}</span>
            </A>
            <CityPicker city={city} onChange={setCity} className={cn("hidden w-36 shrink-0", bp.show)} />
            <GlobalSearch className={cn("hidden min-w-0 max-w-md flex-1", bp.show)} />
          </div>

          <div className="flex min-w-0 shrink items-center gap-3 lg:gap-4">
            <nav aria-label="Main" className={cn("hidden min-w-0 items-center gap-4", bp.nav)}>
              <Dropdown label={t("nav.forPatients")} items={MENUS["For Patients"]} />
              <Dropdown label={t("nav.ourCompany")} items={MENUS["Our Company"]} />
            </nav>
            <LanguagePicker className="hidden shrink-0 lg:block" />
            <A href="/account" className="hidden items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-brand-orange sm:flex">
              <UserRound className="h-4 w-4 text-brand-orange" /> {t("nav.myAppointments")}
            </A>
            <A href={telHref} className="hidden items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-primary 2xl:flex">
              <Phone className="h-4 w-4 text-brand-orange" /> {SITE.phone.display}
            </A>
            <A href="/contact" className="hidden md:inline-flex">
              <OrangeButton className="px-4 py-2.5">{t("action.book")}</OrangeButton>
            </A>
            <button
              type="button"
              aria-label={mobileMenuOpen ? t("action.closeMenu") : t("action.openMenu")}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn("grid h-10 w-10 place-items-center rounded-lg border border-border/80 bg-background text-navy transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", bp.hide)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </div>

      <div className="border-t border-border bg-cream/70 backdrop-blur-sm">
        <Container>
          {/* min-h-11 on every entry: these were 20px tall, under the 24px WCAG 2.2 minimum, and
              this strip is the main way people navigate on a phone. */}
          <nav aria-label={t("nav.browse")} className="no-scrollbar flex items-center gap-5 overflow-x-auto text-sm font-medium">
            <A href={`/doctors${q}`} className="flex min-h-11 shrink-0 items-center gap-1.5 font-semibold text-navy hover:text-brand-orange">
              <Stethoscope className="h-4 w-4 text-emerald-600" /> {t("nav.doctors")}{city ? ` · ${city}` : ""}
            </A>
            <A href={`/hospitals${q}`} className="flex min-h-11 shrink-0 items-center gap-1.5 font-semibold text-navy hover:text-brand-orange">
              <Building2 className="h-4 w-4 text-primary" /> {t("nav.hospitals")}{city ? ` · ${city}` : ""}
            </A>
            {[
              ["nav.specialities", "/specialities"],
              ["nav.treatments", "/treatments"],
              ["nav.conditions", "/conditions"],
              ["nav.surgeryCost", "/cost"],
              ["nav.insurance", "/insurance-eligibility"],
              ["nav.articles", "/blog"],
            ].map(([key, href]) => (
              <A key={href} href={href!} className="flex min-h-11 shrink-0 items-center text-navy/80 hover:text-brand-orange">
                {t(key!)}
              </A>
            ))}
          </nav>
        </Container>
      </div>

      {/* The panel is positioned off the header itself (top-full, and the 100% in the height calc
          resolves to the header's height) rather than a hardcoded top-[105px], which left a gap or
          an overlap whenever the header's height changed — as it just did when the browse strip
          grew to 44px tap targets. */}
      {mobileMenuOpen ? (
        <div className={cn("absolute inset-x-0 top-full z-40 h-[calc(100vh-100%)] overflow-y-auto border-b border-border bg-background p-5 shadow-2xl", bp.hide)}>
          <div className="space-y-5">
            <GlobalSearch onNavigate={() => setMobileMenuOpen(false)} />
            <CityPicker city={city} onChange={setCity} className={cn("w-full", bp.hide)} />
            <LanguagePicker className="w-full lg:hidden" align="start" />
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-navy">
              <A href={`/doctors${q}`} className="flex items-center gap-2 rounded-lg bg-cream p-3">
                <Stethoscope className="h-4 w-4 text-emerald-600" /> {t("nav.doctors")}
              </A>
              <A href={`/hospitals${q}`} className="flex items-center gap-2 rounded-lg bg-cream p-3">
                <Building2 className="h-4 w-4 text-primary" /> {t("nav.hospitals")}
              </A>
              <A href="/account" className="col-span-2 flex items-center gap-2 rounded-lg bg-cream p-3">
                <UserRound className="h-4 w-4 text-brand-orange" /> {t("nav.myAppointments")}
              </A>
            </div>
            {Object.entries(MENUS).map(([title, items]) => (
              <div key={title}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-orange">{title}</p>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {items.map((it) => (
                    <li key={it.href + it.label}>
                      {/* min-h-11 gives these a 44px tap target. They were 20px tall, under even
                          the 24px WCAG 2.2 minimum, which made the mobile menu fiddly to use. */}
                      <A
                        href={it.href}
                        className="flex min-h-11 items-center text-sm text-navy hover:text-brand-orange"
                      >
                        {it.label}
                      </A>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-2.5 border-t border-border pt-4">
              <A href="/contact">
                <OrangeButton className="w-full justify-center">{t("action.book")}</OrangeButton>
              </A>
              <A href={telHref} className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-navy">
                <Phone className="h-4 w-4 text-brand-orange" /> Call {SITE.phone.display}
              </A>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
