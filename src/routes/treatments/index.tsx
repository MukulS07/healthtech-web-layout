import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, ArrowRight, Clock, Database, Loader2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { getTreatmentsFn } from "@/lib/server-functions/treatments";

const specialtyFilters = [
  "All",
  "Proctology",
  "Laparoscopy",
  "Gynaecology",
  "ENT",
  "Urology",
  "Orthopedics",
  "Ophthalmology",
  "Aesthetics",
  "Vascular",
];

export const Route = createFileRoute("/treatments/")({
  loader: async () => {
    try {
      const res = await getTreatmentsFn();
      return res;
    } catch {
      return { success: false, treatments: [], count: 0 };
    }
  },
  head: () => ({
    meta: [
      { title: "All Treatments & Procedures | Prime Care" },
      {
        name: "description",
        content: "Browse surgical treatments across specialties.",
      },
    ],
  }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const initialData = Route.useLoaderData();
  const [treatments, setTreatments] = useState(initialData?.treatments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchFilteredTreatments = async () => {
      setIsLoading(true);
      try {
        const res = await getTreatmentsFn({
          data: {
            category: active === "All" ? "All Categories" : active,
            query,
          },
        });
        if (isMounted && res.success) {
          setTreatments(res.treatments);
        }
      } catch (err) {
        console.error("Failed to load treatments:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFilteredTreatments();
    return () => {
      isMounted = false;
    };
  }, [active, query]);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Eyebrow tone="light">What we treat</Eyebrow>
                <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
                  All Treatments & Procedures
                </h1>
                <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
                  Surgical treatments and procedures across our network.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-navy-foreground backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Database className="h-4 w-4" /> Live Availability
                </p>
                <p className="mt-1 text-2xl font-extrabold">{treatments.length}</p>
                <p className="text-[11px] text-navy-foreground/70">Treatments Loaded</p>
              </div>
            </div>

            <div className="mt-6 flex max-w-lg items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-brand-orange" />
              <input
                className="w-full bg-transparent text-sm text-navy-foreground placeholder:text-navy-foreground/50 outline-none"
                placeholder="Search treatments — e.g. piles, hernia, kidney stone…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
              {specialtyFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active === s
                      ? "bg-navy text-navy-foreground"
                      : "bg-cream text-ink/70 hover:text-navy"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{treatments.length} treatments found</p>
              {isLoading && (
                <span className="flex items-center gap-1.5 text-xs text-brand-orange font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
                </span>
              )}
            </div>

            {treatments.length === 0 ? (
              <div className="py-16 text-center">
                <Database className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">
                  No treatments match your search — try a different query.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {treatments.map((t) => (
                  <article
                    key={t.slug || t.id}
                    className="flex flex-col rounded-lg border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span className="w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
                      {t.category || "General Surgery"}
                    </span>
                    <h2 className="mt-3 text-base font-bold text-navy">{t.name}</h2>
                    <p className="mt-1.5 flex-1 text-sm text-muted-foreground line-clamp-2">
                      {t.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Recovery: {t.recoveryTime}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t.recoveryTime}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <OrangeButton className="flex-1 py-2 text-xs">Book Free Consult</OrangeButton>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <Eyebrow>Not sure which treatment?</Eyebrow>
              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
                Talk to a specialist — it's free
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Our care coordinators match you with the right specialist in under 30 minutes.
              </p>
            </div>
            <ConsultForm />
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
