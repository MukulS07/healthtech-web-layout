import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Star, MapPin, ShieldCheck, ArrowRight, Database, Loader2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";
import { getHospitalsFn } from "@/lib/server-functions/hospitals";

const cityOptions = [
  "All Cities",
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Kochi",
];
const hospitalImages = [hospital1, hospital2];

export const Route = createFileRoute("/hospitals/")({
  loader: async () => {
    try {
      const res = await getHospitalsFn();
      return res;
    } catch {
      return { success: false, hospitals: [], count: 0 };
    }
  },
  head: () => ({
    meta: [
      { title: "Our Hospital Network | Go Surgery" },
      {
        name: "description",
        content: "Explore accredited hospitals across cities.",
      },
    ],
  }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const initialData = Route.useLoaderData();
  const [hospitals, setHospitals] = useState(initialData?.hospitals || []);
  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState("All Cities");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchFilteredHospitals = async () => {
      setIsLoading(true);
      try {
        const res = await getHospitalsFn({
          data: {
            city,
            query,
          },
        });
        if (isMounted && res.success) {
          setHospitals(res.hospitals);
        }
      } catch (err) {
        console.error("Failed to load hospitals:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFilteredHospitals();
    return () => {
      isMounted = false;
    };
  }, [city, query]);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Eyebrow tone="light">Our network</Eyebrow>
                <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
                  Trusted Hospitals Across India
                </h1>
                <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
                  Accredited facilities with advanced surgical suites.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-navy-foreground backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Database className="h-4 w-4" /> Live Availability
                </p>
                <p className="mt-1 text-2xl font-extrabold">{hospitals.length}</p>
                <p className="text-[11px] text-navy-foreground/70">Partner Hospitals Loaded</p>
              </div>
            </div>

            <div className="mt-6 grid max-w-lg gap-3 sm:flex">
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-brand-orange" />
                <input
                  className="w-full bg-transparent text-sm text-navy-foreground placeholder:text-navy-foreground/50 outline-none"
                  placeholder="Search hospitals or cities…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="rounded-xl bg-white/10 px-4 py-3 text-sm text-navy-foreground outline-none"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {cityOptions.map((c) => (
                  <option key={c} className="text-ink">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </Container>
        </section>

        {/* Trust badges */}
        <section className="border-b border-border bg-cream py-6">
          <Container>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-ink/80">
              {[
                "NABH Accredited",
                "24/7 Emergency",
                "Advanced Robotic Surgery",
                "Zero Infection Protocols",
                "Cashless Admissions",
              ].map((b) => (
                <span key={b} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-orange" /> {b}
                </span>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{hospitals.length} hospitals found</p>
              {isLoading && (
                <span className="flex items-center gap-1.5 text-xs text-brand-orange font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
                </span>
              )}
            </div>

            {hospitals.length === 0 ? (
              <div className="py-16 text-center">
                <Database className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">
                  No hospitals match your search — try a different query.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {hospitals.map((h, index) => {
                  const img = h.img || hospitalImages[index % hospitalImages.length];
                  return (
                    <article
                      key={h.slug || h.id}
                      className="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative">
                        <img
                          src={img}
                          alt={h.name}
                          loading="lazy"
                          width={900}
                          height={600}
                          className="h-44 w-full object-cover"
                        />
                        {h.rating && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                            <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />{" "}
                            {h.rating}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className="text-sm font-bold leading-snug text-navy">{h.name}</h2>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {h.city} · {h.beds} Beds
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {h.accreditations.map((a) => (
                            <span
                              key={a}
                              className="rounded-full bg-brand-orange-soft px-2 py-0.5 text-[10px] font-semibold text-brand-orange-dark"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                          {h.specialties.join(" · ")}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <OutlineButton className="flex-1 px-2 py-2 text-xs">
                            Get Directions
                          </OutlineButton>
                          <OrangeButton className="flex-1 px-2 py-2 text-xs">Book Now</OrangeButton>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
