import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal, Star, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";

const cityOptions = ["All Cities", "Delhi NCR", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Kochi"];
const specialtyOptions = ["All Specialties", "Proctology", "Laparoscopy", "Gynaecology", "ENT", "Urology", "Orthopedics", "Ophthalmology"];
const sortOptions = ["Relevance", "Experience: High to Low", "Experience: Low to High", "Rating: High to Low"];

const doctorsList = [
  { name: "Dr. Ananya Rao", slug: "dr-ananya-rao", specialty: "Gynaecology", cred: "MBBS, MS (Obstetrics & Gynaecology)", exp: 14, rating: "4.8", city: "Delhi NCR", img: doctor1 },
  { name: "Dr. Pradeep Dutta", slug: "dr-pradeep-dutta", specialty: "Laparoscopy", cred: "MBBS, MD (Respiratory Medicine)", exp: 27, rating: "4.5", city: "Mumbai", img: doctor2 },
  { name: "Dr. Karan Mehta", slug: "dr-karan-mehta", specialty: "Laparoscopy", cred: "MBBS, MS (General Surgery)", exp: 11, rating: "4.9", city: "Bangalore", img: doctor3 },
  { name: "Dr. Sunita Narang", slug: "dr-sunita-narang", specialty: "Ophthalmology", cred: "MBBS, MS (Ophthalmology)", exp: 18, rating: "4.7", city: "Hyderabad", img: doctor1 },
  { name: "Dr. Ravi Shankar", slug: "dr-ravi-shankar", specialty: "Orthopedics", cred: "MBBS, MS (Orthopaedics), DNB", exp: 22, rating: "4.8", city: "Chennai", img: doctor2 },
  { name: "Dr. Meena Pillai", slug: "dr-meena-pillai", specialty: "ENT", cred: "MBBS, MS (ENT)", exp: 16, rating: "4.6", city: "Kochi", img: doctor3 },
  { name: "Dr. Alok Verma", slug: "dr-alok-verma", specialty: "Urology", cred: "MBBS, MS, MCh (Urology)", exp: 19, rating: "4.9", city: "Delhi NCR", img: doctor1 },
  { name: "Dr. Pooja Sharma", slug: "dr-pooja-sharma", specialty: "Proctology", cred: "MBBS, MS (General Surgery)", exp: 12, rating: "4.7", city: "Pune", img: doctor2 },
  { name: "Dr. Suresh Babu", slug: "dr-suresh-babu", specialty: "Laparoscopy", cred: "MBBS, MS (General Surgery), FACS", exp: 24, rating: "4.8", city: "Bangalore", img: doctor3 },
  { name: "Dr. Nidhi Kapoor", slug: "dr-nidhi-kapoor", specialty: "Gynaecology", cred: "MBBS, DGO, MD (OBG)", exp: 10, rating: "4.6", city: "Mumbai", img: doctor1 },
  { name: "Dr. Harish Kumar", slug: "dr-harish-kumar", specialty: "Orthopedics", cred: "MBBS, MS (Ortho), Fellowship (Joint Replacement)", exp: 15, rating: "4.9", city: "Hyderabad", img: doctor2 },
  { name: "Dr. Fathima Ismail", slug: "dr-fathima-ismail", specialty: "ENT", cred: "MBBS, MS (ENT), Fellowship (Head & Neck Surgery)", exp: 13, rating: "4.7", city: "Chennai", img: doctor3 },
];

export const Route = createFileRoute("/doctors/")({
  head: () => ({
    meta: [
      { title: "Find Specialist Doctors | Prime Care" },
      { name: "description", content: "Browse 400+ verified specialist surgeons across 45+ cities. Filter by specialty, city and experience." },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All Cities");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [sort, setSort] = useState("Relevance");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = doctorsList
    .filter((d) => {
      const matchCity = city === "All Cities" || d.city === city;
      const matchSpec = specialty === "All Specialties" || d.specialty === specialty;
      const matchQ = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.specialty.toLowerCase().includes(query.toLowerCase());
      return matchCity && matchSpec && matchQ;
    })
    .sort((a, b) => {
      if (sort === "Experience: High to Low") return b.exp - a.exp;
      if (sort === "Experience: Low to High") return a.exp - b.exp;
      if (sort === "Rating: High to Low") return parseFloat(b.rating) - parseFloat(a.rating);
      return 0;
    });

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Our specialists</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Find the Right Doctor</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              400+ verified specialists across 13 specialties and 45+ cities. All with 5+ years of surgical experience.
            </p>
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
                {cityOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                className="hidden rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none md:block"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {specialtyOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select
                className="hidden rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none lg:block"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {sortOptions.map((s) => <option key={s}>{s}</option>)}
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
                <select className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none" value={city} onChange={(e) => setCity(e.target.value)}>
                  {cityOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  {specialtyOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select className="col-span-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {sortOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <p className="mb-6 text-sm text-muted-foreground">{filtered.length} doctors found</p>
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">No doctors match your filters. Try broadening your search.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((d) => (
                  <article key={d.slug} className="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative">
                      <img src={d.img} alt={d.name} loading="lazy" width={700} height={700} className="h-52 w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">{d.specialty}</span>
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                        <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {d.rating}
                      </span>
                    </div>
                    <div className="p-4">
                      <h2 className="truncate text-base font-bold text-navy">{d.name}</h2>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{d.cred}</p>
                      <p className="mt-2 text-xs font-semibold text-brand-blue">{d.exp} Years Experience</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {d.city}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <OutlineButton className="flex-1 px-2 py-2 text-xs">
                          <Phone className="h-3 w-3" /> Call
                        </OutlineButton>
                        <OrangeButton className="flex-1 px-2 py-2 text-xs">Book Now</OrangeButton>
                      </div>
                      <a
                        href={`/doctors/${d.slug}`}
                        className="mt-2 block text-center text-xs font-semibold text-brand-orange hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
