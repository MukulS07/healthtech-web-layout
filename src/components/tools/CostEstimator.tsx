import { useMemo, useState } from "react";
import { ArrowRight, IndianRupee, Search } from "lucide-react";
import { OrangeButton, OutlineButton } from "@/components/home/primitives";
import { SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { COST_SOURCE_LABELS, costFor, costForCity, formatRupees } from "@/data/cost";
import { CITIES, COSTS_PUBLISHED } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Looks up the cost band we hold for a procedure (optionally for one city) — it does no arithmetic
 * of its own. Until an entry is `verified` and COSTS_PUBLISHED is on (src/data/cost.ts,
 * src/lib/site.ts), it shows the estimate-request message instead of a number, so placeholder
 * bands can never reach a patient.
 */
export function CostEstimator({ className, defaultTreatment }: { className?: string; defaultTreatment?: string }) {
  const [slug, setSlug] = useState(defaultTreatment ?? "");
  const [citySlug, setCitySlug] = useState("");
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();
  const options = useMemo(() => {
    // The chosen procedure always stays in the list, even when the filter text doesn't match it.
    // Without this the <select> lost its option while React still held the slug, so the dropdown
    // read "Select a procedure" while the panel beside it still showed the previous result.
    const list = term
      ? TREATMENTS.filter(
          (t) => t.slug === slug || `${t.name} ${(t.aka ?? []).join(" ")}`.toLowerCase().includes(term),
        )
      : TREATMENTS;
    return SPECIALITIES.map((s) => ({ speciality: s, items: list.filter((t) => t.speciality === s.slug) })).filter(
      (g) => g.items.length > 0,
    );
  }, [term, slug]);

  const treatment = TREATMENTS.find((t) => t.slug === slug);
  const band = treatment ? costFor(treatment.slug) : null;
  const cityBand = treatment && citySlug ? costForCity(treatment.slug, citySlug) : null;
  const cityName = CITIES.find((c) => c.slug === citySlug)?.name;
  const shown = cityBand ?? (band ? { min: band.min, max: band.max } : null);
  const canShow = COSTS_PUBLISHED && band?.verified && shown;

  return (
    <div className={cn("rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6", className)}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0 space-y-4">
          <div>
            <label htmlFor="cost-search" className="text-sm font-semibold text-navy">
              1. Find your procedure
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-brand-orange" />
              <input
                id="cost-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type to filter — e.g. piles, hernia, knee"
                className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
              />
            </div>
            <select
              aria-label="Procedure"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-navy outline-none focus:border-primary"
            >
              <option value="">Select a procedure</option>
              {options.map((g) => (
                <optgroup key={g.speciality.slug} label={g.speciality.name}>
                  {g.items.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cost-city" className="text-sm font-semibold text-navy">
              2. Your city <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <select
              id="cost-city"
              value={citySlug}
              onChange={(e) => setCitySlug(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-navy outline-none focus:border-primary"
            >
              <option value="">Any city</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-navy p-5 text-navy-foreground">
          {!treatment ? (
            <>
              <p className="text-sm font-semibold">Pick a procedure to see what we hold</p>
              <p className="mt-2 text-xs leading-relaxed text-navy-foreground/70">
                We'll show the cost range for it, where we have one we can stand behind, and what
                drives the final bill.
              </p>
            </>
          ) : canShow && shown ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-foreground/70">
                {treatment.name}
                {cityName ? ` · ${cityName}` : ""}
              </p>
              <p className="mt-1 text-3xl font-bold text-brand-orange">
                {formatRupees(shown.min)} – {formatRupees(shown.max)}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-navy-foreground/70">
                {band ? COST_SOURCE_LABELS[band.source] : ""}
                {band?.updatedAt
                  ? ` · checked ${new Date(band.updatedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`
                  : ""}
                {cityBand ? "" : cityName ? " · not specific to your city" : ""}. Your own quote comes
                from the hospital you choose.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-foreground/70">
                {treatment.name}
                {cityName ? ` · ${cityName}` : ""}
              </p>
              <p className="mt-2 text-sm font-semibold">No price published for this yet</p>
              <p className="mt-2 text-xs leading-relaxed text-navy-foreground/70">
                We only show figures we can stand behind, and we don't have one for this procedure
                yet. Tell us your case and we'll help you get a written estimate from the hospital
                and check what your insurance covers.
              </p>
            </>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <a href={treatment ? `/contact?interest=${encodeURIComponent(`t:${treatment.slug}`)}${citySlug && cityName ? `&city=${encodeURIComponent(cityName)}` : ""}` : "/contact"}>
              <OrangeButton className="px-4 py-2 text-sm">Ask for an estimate</OrangeButton>
            </a>
            {treatment ? (
              <a href={`/cost/${treatment.slug}`}>
                <OutlineButton tone="light" className="px-4 py-2 text-sm">
                  Cost details <ArrowRight className="h-3.5 w-3.5" />
                </OutlineButton>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
        <IndianRupee className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
        <span>
          This looks up the range we hold for a procedure — it is not a quote and not personalised.
          Hospital, city, room category, the technique used and your insurance all change what you
          actually pay.
        </span>
      </p>
    </div>
  );
}
