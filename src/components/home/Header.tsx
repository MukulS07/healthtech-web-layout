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
import { cn } from "@/lib/utils";

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
          aria-label="Search doctors, treatments, conditions and cities"
          role="combobox"
          aria-expanded={open && results.length > 0}
          autoComplete="off"
          className="w-full min-w-0 truncate bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground/80"
          placeholder="Search doctors, treatments, conditions"
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

function CityPicker({ city, onChange, className }: { city: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={cn("flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-semibold text-navy", className)}>
      <MapPin className="h-4 w-4 shrink-0 text-brand-orange" />
      <span className="sr-only">Select your city</span>
      <select value={city} onChange={(e) => onChange(e.target.value)} className="max-w-[9rem] bg-transparent outline-none">
        <option value="">Select city</option>
        {CITIES.map((c) => (
          <option key={c.slug} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
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
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
      >
        {label} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 pt-2">
          <ul className={cn("grid gap-0.5 rounded-xl border border-border bg-background p-2 shadow-xl", items.length > 8 ? "w-[30rem] grid-cols-2" : "w-60")}>
            {items.map((it) => (
              <li key={it.href + it.label}>
                <a href={it.href} className="block rounded-md px-3 py-2 text-sm text-navy hover:bg-cream">
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [city, setCity] = useCity();
  const q = city ? `?city=${encodeURIComponent(city)}` : "";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="text-navy">
        <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between">
          <div className="flex min-w-0 items-center gap-4 lg:flex-1 lg:gap-5">
            <a href="/" className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </span>
              <span className="truncate text-lg font-bold tracking-tight">{SITE.name}</span>
            </a>
            <CityPicker city={city} onChange={setCity} className="hidden lg:flex" />
            <GlobalSearch className="hidden min-w-0 max-w-md flex-1 lg:block" />
          </div>

          <div className="flex shrink-0 items-center gap-3 lg:gap-4">
            <nav aria-label="Main" className="hidden items-center gap-4 xl:flex">
              <Dropdown label="For Patients" items={MENUS["For Patients"]} />
              <Dropdown label="Our Company" items={MENUS["Our Company"]} />
            </nav>
            <a href="/account" className="hidden items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-brand-orange sm:flex">
              <UserRound className="h-4 w-4 text-brand-orange" /> My Appointments
            </a>
            <a href={telHref} className="hidden items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-primary 2xl:flex">
              <Phone className="h-4 w-4 text-brand-orange" /> {SITE.phone.display}
            </a>
            <a href="/contact" className="hidden md:inline-flex">
              <OrangeButton className="px-4 py-2.5">{BOOK_LABEL}</OrangeButton>
            </a>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border/80 bg-background text-navy transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </div>

      <div className="border-t border-border bg-cream/70 backdrop-blur-sm">
        <Container>
          <nav aria-label="Browse" className="no-scrollbar flex items-center gap-5 overflow-x-auto py-2.5 text-sm font-medium">
            <a href={`/doctors${q}`} className="flex shrink-0 items-center gap-1.5 font-semibold text-navy hover:text-brand-orange">
              <Stethoscope className="h-4 w-4 text-emerald-600" /> Doctors{city ? ` in ${city}` : ""}
            </a>
            <a href={`/hospitals${q}`} className="flex shrink-0 items-center gap-1.5 font-semibold text-navy hover:text-brand-orange">
              <Building2 className="h-4 w-4 text-primary" /> Hospitals{city ? ` in ${city}` : ""}
            </a>
            {[
              ["Specialities", "/specialities"],
              ["Treatments", "/treatments"],
              ["Conditions", "/conditions"],
              ["Surgery Cost", "/cost"],
              ["Insurance", "/insurance-eligibility"],
              ["Articles", "/blog"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="shrink-0 text-navy/80 hover:text-brand-orange">
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[105px] z-40 overflow-y-auto border-b border-border bg-background p-5 shadow-2xl xl:hidden">
          <div className="space-y-5">
            <GlobalSearch className="lg:hidden" onNavigate={() => setMobileMenuOpen(false)} />
            <CityPicker city={city} onChange={setCity} className="w-full lg:hidden" />
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-navy">
              <a href={`/doctors${q}`} className="flex items-center gap-2 rounded-lg bg-cream p-3">
                <Stethoscope className="h-4 w-4 text-emerald-600" /> Doctors
              </a>
              <a href={`/hospitals${q}`} className="flex items-center gap-2 rounded-lg bg-cream p-3">
                <Building2 className="h-4 w-4 text-primary" /> Hospitals
              </a>
              <a href="/account" className="col-span-2 flex items-center gap-2 rounded-lg bg-cream p-3">
                <UserRound className="h-4 w-4 text-brand-orange" /> My Appointments
              </a>
            </div>
            {Object.entries(MENUS).map(([title, items]) => (
              <div key={title}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-orange">{title}</p>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {items.map((it) => (
                    <li key={it.href + it.label}>
                      <a href={it.href} className="block py-1.5 text-sm text-navy hover:text-brand-orange">
                        {it.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-2.5 border-t border-border pt-4">
              <a href="/contact">
                <OrangeButton className="w-full justify-center">{BOOK_LABEL}</OrangeButton>
              </a>
              <a href={telHref} className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-navy">
                <Phone className="h-4 w-4 text-brand-orange" /> Call {SITE.phone.display}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
