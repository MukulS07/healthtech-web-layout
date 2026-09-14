import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Star, Phone, MapPin, Database, Loader2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";
import { getDoctorsFn } from "@/lib/server-functions/doctors";

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
const specialtyOptions = [
  "All Specialties",
  "Proctology",
  "Laparoscopy",
  "Gynaecology",
  "ENT",
  "Urology",
  "Orthopedics",
  "Ophthalmology",
];
const sortOptions = [
  "Relevance",
  "Experience: High to Low",
  "Experience: Low to High",
  "Rating: High to Low",
];

const avatarList = [doctor1, doctor2, doctor3];

export const Route = createFileRoute("/doctors/")({
  loader: async () => {
    try {
      const res = await getDoctorsFn();
      return res;
    } catch {
      return { success: false, doctors: [], count: 0 };
    }
  },
  head: () => ({
    meta: [
      { title: "Find Specialist Doctors | Prime Care" },
      {
        name: "description",
        content:
          "Browse verified specialist surgeons across 45+ cities. Filter by specialty, city and experience.",
      },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const initialData = Route.useLoaderData();
  const [doctors, setDoctors] = useState(initialData?.doctors || []);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All Cities");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [sort, setSort] = useState("Relevance");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFilteredDoctors = async () => {
      setIsLoading(true);
      try {
        const res = await getDoctorsFn({
          data: {
            city,
            specialty,
            query,
            sort,
          },
        });
        if (isMounted && res.success) {
          setDoctors(res.doctors);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFilteredDoctors();
    return () => {
      isMounted = false;
    };
  }, [city, specialty, query, sort]);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Eyebrow tone="light">Our specialists</Eyebrow>
                <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
                  Find the Right Doctor
                </h1>
                <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
                  Verified specialists across top specialties and cities. All with 5+ years of
                  surgical experience.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-navy-foreground backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Database className="h-4 w-4" /> Live Availability
                </p>
                <p className="mt-1 text-2xl font-extrabold">{doctors.length}</p>
                <p className="text-[11px] text-navy-foreground/70">Verified Specialists Loaded</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="sticky top-[73px] z-40 border-b border-border bg-background/95 py-4 backdrop-blur">
          <Container>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-brand-orange" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search doctors or specialties…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="hidden rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none sm:block"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {cityOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                className="hidden rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none md:block"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {specialtyOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                className="hidden rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none lg:block"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {sortOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-ink sm:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>
            {showFilters && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:hidden">
                <select
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {cityOptions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  {specialtyOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  className="col-span-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {sortOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{doctors.length} doctors found</p>
              {isLoading && (
                <span className="flex items-center gap-1.5 text-xs text-brand-orange font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
                </span>
              )}
            </div>

            {doctors.length === 0 ? (
              <div className="py-16 text-center">
                <Database className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">
                  No doctors match your criteria. Try broadening your search.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {doctors.map((d, index) => {
                  const avatar = d.img || avatarList[index % avatarList.length];
                  return (
                    <article
                      key={d.slug || d.id}
                      className="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative">
                        <img
                          src={avatar}
                          alt={d.name}
                          loading="lazy"
                          width={700}
                          height={700}
                          className="h-52 w-full object-cover"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">
                          {d.specialty}
                        </span>
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                          <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />{" "}
                          {d.rating}
                        </span>
                      </div>
                      <div className="p-4">
                        <h2 className="truncate text-base font-bold text-navy">{d.name}</h2>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {d.cred}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-brand-blue">
                          {d.exp} Years Experience
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {d.city}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <OutlineButton className="flex-1 px-2 py-2 text-xs">
                            <Phone className="h-3 w-3" /> Call
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
