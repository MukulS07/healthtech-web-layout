import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Building2, Loader2, MapPin, Search, SearchX, Star } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import { Pagination } from "@/components/common/Pagination";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";
import { getHospitalFacetsFn, getHospitalsFn } from "@/lib/server-functions/hospitals";
import { getSpeciality } from "@/data/catalog";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const hospitalImages = [hospital1, hospital2];
const PAGE_SIZE = 24;
const MAX_CHIPS = 4;

type HospitalsSearch = {
  city?: string | undefined;
  speciality?: string | undefined;
  q?: string | undefined;
  page?: number | undefined;
};

export const Route = createFileRoute("/hospitals/")({
  validateSearch: (s: Record<string, unknown>): HospitalsSearch => ({
    city: typeof s["city"] === "string" && s["city"] ? (s["city"] as string) : undefined,
    speciality: typeof s["speciality"] === "string" && s["speciality"] ? (s["speciality"] as string) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? (s["q"] as string) : undefined,
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [list, facets] = await Promise.all([
      getHospitalsFn({ data: { city: deps.city, speciality: deps.speciality, query: deps.q, page: deps.page, limit: PAGE_SIZE } }).catch(() => null),
      getHospitalFacetsFn().catch(() => null),
    ]);
    return { list, facets };
  },
  head: ({ match }) => {
    const s = match.search as HospitalsSearch;
    const spec = s.speciality ? getSpeciality(s.speciality)?.name : undefined;
    const params = new URLSearchParams();
    if (s.speciality) params.set("speciality", s.speciality);
    if (s.city) params.set("city", s.city);
    if (s.page) params.set("page", String(s.page));
    const qs = params.toString();
    const title = `${spec ? `${spec} Hospitals` : "Hospitals"}${s.city ? ` in ${s.city}` : ""}`;
    return seo({
      title: `${title}${s.page ? ` — Page ${s.page}` : ""}`,
      description: `Browse ${spec ? `${spec.toLowerCase()} ` : ""}hospitals${s.city ? ` in ${s.city}` : ""} in the Go Surgery directory — departments, surgeons who practise there and patient ratings.`,
      path: `/hospitals${qs ? `?${qs}` : ""}`,
      noindex: Boolean(s.q),
    });
  },
  component: HospitalsPage,
});

function HospitalsPage() {
  const { list, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/hospitals/" });
  const [query, setQuery] = useState(search.q ?? "");
  const [pending, setPending] = useState(false);
  const hospitals = list?.success ? list.hospitals : [];
  const failed = !list || !list.success;

  const update = (patch: Partial<HospitalsSearch>) => {
    setPending(true);
    navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page }), resetScroll: false }).finally(() => setPending(false));
  };

  useEffect(() => {
    if ((search.q ?? "") === query) return;
    const t = setTimeout(() => update({ q: query || undefined }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const selectClass = "rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none";
  const clear = () => {
    setQuery("");
    navigate({ search: {} });
  };

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Hospital directory</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              {search.speciality ? `${getSpeciality(search.speciality)?.name ?? ""} ` : ""}Hospitals
              {search.city ? ` in ${search.city}` : ""}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">
              Search hospitals by name, city or speciality and see which surgeons practise there. Our
              care team can help you choose based on your treatment and insurance.
            </p>
          </Container>
        </section>

        <section className="sticky top-[73px] z-40 border-b border-border bg-background/95 py-3 backdrop-blur">
          <Container>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <label className="col-span-2 flex flex-1 items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2.5 sm:min-w-[240px]">
                <Search className="h-4 w-4 shrink-0 text-brand-orange" />
                <span className="sr-only">Search hospitals by name</span>
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search by hospital name or area…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select aria-label="City" className={selectClass} value={search.city ?? ""} onChange={(e) => update({ city: e.target.value || undefined })}>
                <option value="">All cities</option>
                {facets?.cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
              <select aria-label="Speciality" className={selectClass} value={search.speciality ?? ""} onChange={(e) => update({ speciality: e.target.value || undefined })}>
                <option value="">All specialities</option>
                {facets?.specialities.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </Container>
        </section>

        <section className="py-8">
          <Container>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {failed ? "Couldn't load hospitals." : `${(list?.total ?? 0).toLocaleString("en-IN")} hospitals found${(list?.totalPages ?? 1) > 1 ? ` · page ${list?.page} of ${list?.totalPages}` : ""}`}
                {pending ? <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-brand-orange" /> : null}
              </p>
              {search.city || search.speciality || search.q ? (
                <button type="button" onClick={clear} className="text-xs font-semibold text-primary hover:underline">
                  Clear filters
                </button>
              ) : null}
            </div>

            {failed ? (
              <div className="rounded-xl border border-border bg-cream py-14 text-center">
                <AlertTriangle className="mx-auto h-9 w-9 text-brand-orange" />
                <p className="mt-3 font-semibold text-navy">We couldn't load the hospital directory.</p>
                <OutlineButton className="mt-4" onClick={() => window.location.reload()}>Retry</OutlineButton>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="rounded-xl border border-border bg-cream py-14 text-center">
                <SearchX className="mx-auto h-9 w-9 text-muted-foreground/60" />
                <p className="mt-3 font-semibold text-navy">No hospitals match these filters.</p>
                <OutlineButton className="mt-4" onClick={clear}>Clear filters</OutlineButton>
              </div>
            ) : (
              <div className={cn("grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3", pending && "opacity-60")}>
                {hospitals.map((h, index) => {
                  const href = h.slug ? `/hospitals/${h.slug}` : "/hospitals";
                  const extra = h.specialties.length - MAX_CHIPS;
                  return (
                    <article key={h.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
                      <a href={href} className="block">
                        <div className="relative">
                          <img
                            src={h.img || hospitalImages[index % hospitalImages.length]}
                            alt={h.name}
                            loading="lazy"
                            width={900}
                            height={600}
                            className="h-44 w-full object-cover"
                          />
                          {h.rating ? (
                            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy shadow-sm">
                              <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {h.rating}
                              <span className="font-medium text-muted-foreground">({h.reviewCount})</span>
                            </span>
                          ) : null}
                        </div>
                        <div className="p-4 pb-0">
                          <h2 className="line-clamp-1 text-base font-bold text-navy">{h.name}</h2>
                          <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
                            <span className="line-clamp-1">{[h.locality, h.city].filter(Boolean).join(", ")}</span>
                          </p>
                          {h.totalDoctors ? (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5 shrink-0" /> {h.totalDoctors} doctors listed
                            </p>
                          ) : null}
                          {h.specialties.length ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {h.specialties.slice(0, MAX_CHIPS).map((sp) => (
                                <span key={sp} className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy">{sp}</span>
                              ))}
                              {extra > 0 ? <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">+{extra} more</span> : null}
                            </div>
                          ) : null}
                        </div>
                      </a>
                      <div className="mt-auto flex gap-2 p-4">
                        <a href={href} className="flex-1">
                          <OutlineButton className="w-full justify-center px-2 py-2 text-xs">View details</OutlineButton>
                        </a>
                        <a href={`/contact?city=${encodeURIComponent(h.city)}`} className="flex-1">
                          <OrangeButton className="w-full justify-center px-2 py-2 text-xs">Request consult</OrangeButton>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {list?.success && list.totalPages > 1 ? (
              <Pagination
                page={list.page}
                totalPages={list.totalPages}
                hrefFor={(p) => {
                  const params = new URLSearchParams();
                  if (search.city) params.set("city", search.city);
                  if (search.speciality) params.set("speciality", search.speciality);
                  if (search.q) params.set("q", search.q);
                  if (p > 1) params.set("page", String(p));
                  const qs = params.toString();
                  return `/hospitals${qs ? `?${qs}` : ""}`;
                }}
              />
            ) : null}

            <p className="mt-10 text-center text-[11px] text-muted-foreground">
              Hospital names and trademarks belong to their respective owners. A listing in our directory
              does not imply affiliation with or endorsement by the hospital.
            </p>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
