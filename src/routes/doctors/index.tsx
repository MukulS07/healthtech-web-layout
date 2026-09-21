import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, LayoutGrid, List, Loader2, Search, SearchX } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OutlineButton } from "@/components/home/primitives";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Pagination } from "@/components/common/Pagination";
import { getDoctorFacetsFn, getDoctorsFn } from "@/lib/server-functions/doctors";
import { getSpeciality } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";
import { CONSULT_PHRASE, DEFAULT_WORDING } from "@/lib/site";
import { A } from "@/components/common/A";
import { useSpecName, useT } from "@/lib/i18n/context";

// `value` is what goes in the URL and what the server matches on, so it stays English.
const sortOptions = [
  { value: "Relevance", key: "dir.sortRelevance" },
  { value: "Experience: High to Low", key: "dir.sortExp" },
  { value: "Rating: High to Low", key: "dir.sortRating" },
];
const PAGE_SIZE = 24;

type DoctorsSearch = {
  city?: string | undefined;
  specialty?: string | undefined;
  q?: string | undefined;
  sort?: string | undefined;
  page?: number | undefined;
};

export const Route = createFileRoute("/doctors/")({
  validateSearch: (s: Record<string, unknown>): DoctorsSearch => ({
    city: typeof s["city"] === "string" && s["city"] ? (s["city"] as string) : undefined,
    specialty: typeof s["specialty"] === "string" && s["specialty"] ? (s["specialty"] as string) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? (s["q"] as string) : undefined,
    sort: typeof s["sort"] === "string" && s["sort"] ? (s["sort"] as string) : undefined,
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    // An unknown ?specialty= used to render "<slug> Surgeons" with zero results and a 200, so any
    // made-up value minted an indexable empty page. Same for a page number past the end.
    if (deps.specialty && !getSpeciality(deps.specialty)) throw notFound();

    const [list, facets] = await Promise.all([
      getDoctorsFn({
        data: { city: deps.city, specialty: deps.specialty, query: deps.q, sort: deps.sort, page: deps.page, limit: PAGE_SIZE },
      }).catch(() => null),
      getDoctorFacetsFn().catch(() => null),
    ]);

    if (deps.page && list?.success && list.total > 0 && deps.page > Math.ceil(list.total / PAGE_SIZE)) {
      throw notFound();
    }
    return { list, facets };
  },
  head: ({ match }) => {
    const search = match.search as DoctorsSearch;
    const spec = search.specialty ? getSpeciality(search.specialty)?.name : undefined;
    const place = search.city ? ` in ${search.city}` : "";
    const title = spec ? `Best ${spec} Surgeons${place}` : `Find Surgeons & Specialists${place}`;
    const params = new URLSearchParams();
    if (search.specialty) params.set("specialty", search.specialty);
    if (search.city) params.set("city", search.city);
    if (search.page) params.set("page", String(search.page));
    const qs = params.toString();
    return seo({ locale: match.context.locale,
      title: `${title}${search.page ? ` — Page ${search.page}` : ""}`,
      description: `Browse surgeons${spec ? ` specialising in ${spec}` : ""}${place}. Compare qualifications, experience and hospitals, and book ${CONSULT_PHRASE} with Go Surgery.`,
      path: `/doctors${qs ? `?${qs}` : ""}`,
      // Free-text search results shouldn't be indexed.
      noindex: Boolean(search.q),
    });
  },
  component: DoctorsPage,
});

function DoctorsPage() {
  const t = useT();
  const specLabel = useSpecName();
  const { list, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/doctors/" });
  const [query, setQuery] = useState(search.q ?? "");
  const [layout, setLayout] = useState<"card" | "row">("card");
  const [pending, setPending] = useState(false);

  const doctors = list?.success ? list.doctors : [];
  const failed = !list || !list.success;

  // Remember the preferred layout; default to compact rows on small screens.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("doctors-layout");
      if (saved === "card" || saved === "row") setLayout(saved);
      else if (window.innerWidth < 640) setLayout("row");
    } catch {
      if (window.innerWidth < 640) setLayout("row");
    }
  }, []);
  const chooseLayout = (l: "card" | "row") => {
    setLayout(l);
    try {
      localStorage.setItem("doctors-layout", l);
    } catch {
      /* storage unavailable */
    }
  };

  const update = (patch: Partial<DoctorsSearch>) => {
    setPending(true);
    navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page }), resetScroll: false }).finally(() =>
      setPending(false),
    );
  };

  // Debounce the free-text search into the URL.
  useEffect(() => {
    if ((search.q ?? "") === query) return;
    const t = setTimeout(() => update({ q: query || undefined }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const activeSpec = search.specialty ? getSpeciality(search.specialty) : undefined;
  const specName = search.specialty ? specLabel(search.specialty, activeSpec?.name ?? search.specialty) : null;
  const hasFilters = Boolean(search.city || search.specialty || search.q);
  const selectClass = "rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none";

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{t("dir.docEyebrow")}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              {(() => {
                const title = specName ? t("dir.docTitleSpec", { spec: specName }) : t("dir.docTitle");
                return search.city ? t("dir.titleInCity", { title, city: search.city }) : title;
              })()}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">
              {DEFAULT_WORDING
                ? t("dir.docIntro")
                : `Surgeons and surgical specialists listed in our directory. Compare qualifications, experience and where they practise — then book ${CONSULT_PHRASE} and our care team will help you choose.`}
            </p>
          </Container>
        </section>

        <section className="sticky top-[73px] z-40 border-b border-border bg-background/95 py-3 backdrop-blur">
          <Container>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <label className="col-span-2 flex flex-1 items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2.5 sm:min-w-[240px]">
                <Search className="h-4 w-4 shrink-0 text-brand-orange" />
                <span className="sr-only">{t("dir.searchDoctors")}</span>
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={t("dir.searchDoctorsPh")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label={t("form.city")}
                className={selectClass}
                value={search.city ?? ""}
                onChange={(e) => update({ city: e.target.value || undefined })}
              >
                <option value="">{t("city.allCities")}</option>
                {facets?.cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count.toLocaleString("en-IN")})
                  </option>
                ))}
                {search.city && !facets?.cities.some((c) => c.name === search.city) ? (
                  <option value={search.city}>{search.city}</option>
                ) : null}
              </select>
              <select
                aria-label={t("dir.speciality")}
                className={selectClass}
                value={search.specialty ?? ""}
                onChange={(e) => update({ specialty: e.target.value || undefined })}
              >
                <option value="">{t("dir.allSpecs")}</option>
                {facets?.specialities.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {specLabel(s.slug, s.name)} ({s.count.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
              <select
                aria-label={t("dir.sortBy")}
                className={cn(selectClass, "col-span-2 sm:col-span-1")}
                value={search.sort ?? "Relevance"}
                onChange={(e) => update({ sort: e.target.value === "Relevance" ? undefined : e.target.value })}
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {t(s.key)}
                  </option>
                ))}
              </select>
            </div>
          </Container>
        </section>

        <section className="py-8">
          <Container>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {failed
                  ? t("dir.docLoadShort")
                  : (list?.totalPages ?? 1) > 1
                    ? t("dir.doctorsFoundPaged", {
                        n: (list?.total ?? 0).toLocaleString("en-IN"),
                        page: list?.page ?? 1,
                        total: list?.totalPages ?? 1,
                      })
                    : t("dir.doctorsFound", { n: (list?.total ?? 0).toLocaleString("en-IN") })}
                {pending ? <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-brand-orange" /> : null}
              </p>
              <div className="flex items-center gap-2">
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      navigate({ search: {} });
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t("dir.clearFilters")}
                  </button>
                ) : null}
                <div className="flex rounded-lg border border-border p-0.5">
                  <button
                    type="button"
                    aria-label={t("dir.gridView")}
                    aria-pressed={layout === "card"}
                    onClick={() => chooseLayout("card")}
                    className={cn("rounded-md p-1.5", layout === "card" ? "bg-navy text-white" : "text-muted-foreground")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={t("dir.listView")}
                    aria-pressed={layout === "row"}
                    onClick={() => chooseLayout("row")}
                    className={cn("rounded-md p-1.5", layout === "row" ? "bg-navy text-white" : "text-muted-foreground")}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {failed ? (
              <div className="rounded-xl border border-border bg-cream py-14 text-center">
                <AlertTriangle className="mx-auto h-9 w-9 text-brand-orange" />
                <p className="mt-3 font-semibold text-navy">{t("dir.docFailTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("dir.checkConnection")}</p>
                <OutlineButton className="mt-4" onClick={() => window.location.reload()}>
                  {t("action.retry")}
                </OutlineButton>
              </div>
            ) : doctors.length === 0 ? (
              <div className="rounded-xl border border-border bg-cream py-14 text-center">
                <SearchX className="mx-auto h-9 w-9 text-muted-foreground/60" />
                <p className="mt-3 font-semibold text-navy">{t("dir.docNoneTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("dir.docNoneSub")}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <OutlineButton
                    onClick={() => {
                      setQuery("");
                      navigate({ search: {} });
                    }}
                  >
                    {t("dir.clearFilters")}
                  </OutlineButton>
                  <A href="/contact">
                    <OutlineButton>{t("dir.talkSpecialist")}</OutlineButton>
                  </A>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "transition-opacity",
                  pending && "opacity-60",
                  layout === "card" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-3 md:grid-cols-2",
                )}
              >
                {doctors.map((d) => (
                  <DoctorCard key={d.id} doctor={d} layout={layout} />
                ))}
              </div>
            )}

            {list?.success && list.totalPages > 1 ? (
              <Pagination
                page={list.page}
                totalPages={list.totalPages}
                hrefFor={(p) => {
                  const params = new URLSearchParams();
                  if (search.city) params.set("city", search.city);
                  if (search.specialty) params.set("specialty", search.specialty);
                  if (search.q) params.set("q", search.q);
                  if (search.sort) params.set("sort", search.sort);
                  if (p > 1) params.set("page", String(p));
                  const qs = params.toString();
                  return `/doctors${qs ? `?${qs}` : ""}`;
                }}
              />
            ) : null}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
