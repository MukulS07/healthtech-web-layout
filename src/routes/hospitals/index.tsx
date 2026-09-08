import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Star, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";

const cityOptions = ["All Cities", "Delhi NCR", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Kochi"];

const hospitalsList = [
  { name: "Prime Care Sunrise Hospital", slug: "sunrise-hospital", city: "Hyderabad", rating: "4.9", beds: 120, accreditations: ["NABH", "ISO 9001"], specialties: ["Proctology", "Urology", "Orthopedics"], img: hospital1 },
  { name: "Prime Care Meridian Centre", slug: "meridian-centre", city: "Gurgaon", rating: "4.8", beds: 80, accreditations: ["NABH", "NABL"], specialties: ["Laparoscopy", "Gynaecology", "ENT"], img: hospital2 },
  { name: "Prime Care Lakeview Hospital", slug: "lakeview-hospital", city: "Kochi", rating: "4.7", beds: 100, accreditations: ["NABH"], specialties: ["Ophthalmology", "ENT", "Aesthetics"], img: hospital1 },
  { name: "Prime Care City Institute", slug: "city-institute", city: "Delhi NCR", rating: "4.6", beds: 200, accreditations: ["NABH", "JCI", "ISO 9001"], specialties: ["Orthopedics", "Vascular", "Laparoscopy"], img: hospital2 },
  { name: "Prime Care Metro Clinic", slug: "metro-clinic", city: "Mumbai", rating: "4.8", beds: 60, accreditations: ["NABH"], specialties: ["Proctology", "Urology", "Gynaecology"], img: hospital1 },
  { name: "Prime Care Greenfield Hospital", slug: "greenfield-hospital", city: "Bangalore", rating: "4.9", beds: 150, accreditations: ["NABH", "NABL", "ISO 9001"], specialties: ["Ophthalmology", "ENT", "Orthopedics"], img: hospital2 },
  { name: "Prime Care Eastern Centre", slug: "eastern-centre", city: "Kolkata", rating: "4.5", beds: 90, accreditations: ["NABH"], specialties: ["Laparoscopy", "Gynaecology"], img: hospital1 },
  { name: "Prime Care Southern Hospital", slug: "southern-hospital", city: "Chennai", rating: "4.7", beds: 110, accreditations: ["NABH", "ISO 9001"], specialties: ["Urology", "Vascular", "ENT"], img: hospital2 },
];

export const Route = createFileRoute("/hospitals/")({
  head: () => ({
    meta: [
      { title: "Our Hospital Network | Prime Care" },
      { name: "description", content: "Explore 800+ accredited hospitals across 45+ cities. NABH certified, 24/7 emergency, advanced robotic surgery." },
    ],
  }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const [city, setCity] = useState("All Cities");
  const [query, setQuery] = useState("");

  const filtered = hospitalsList.filter((h) => {
    const matchCity = city === "All Cities" || h.city === city;
    const matchQ = !query || h.name.toLowerCase().includes(query.toLowerCase()) || h.city.toLowerCase().includes(query.toLowerCase());
    return matchCity && matchQ;
  });

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Our network</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Trusted Hospitals Across India</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              800+ accredited facilities with advanced surgical suites, 24/7 emergency care and zero-infection protocols.
            </p>
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
                {cityOptions.map((c) => <option key={c} className="text-ink">{c}</option>)}
              </select>
            </div>
          </Container>
        </section>

        {/* Trust badges */}
        <section className="border-b border-border bg-cream py-6">
          <Container>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-ink/80">
              {["NABH Accredited", "24/7 Emergency", "Advanced Robotic Surgery", "Zero Infection Protocols", "Cashless Admissions"].map((b) => (
                <span key={b} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-orange" /> {b}
                </span>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <p className="mb-6 text-sm text-muted-foreground">{filtered.length} hospitals found</p>
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">No hospitals match your search — try a different city.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((h) => (
                  <article key={h.slug} className="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative">
                      <img src={h.img} alt={h.name} loading="lazy" width={900} height={600} className="h-44 w-full object-cover" />
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                        <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {h.rating}
                      </span>
                    </div>
                    <div className="p-4">
                      <h2 className="text-sm font-bold leading-snug text-navy">{h.name}</h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {h.city} · {h.beds} Beds
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {h.accreditations.map((a) => (
                          <span key={a} className="rounded-full bg-brand-orange-soft px-2 py-0.5 text-[10px] font-semibold text-brand-orange-dark">{a}</span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{h.specialties.join(" · ")}</p>
                      <div className="mt-4 flex gap-2">
                        <OutlineButton className="flex-1 px-2 py-2 text-xs">Get Directions</OutlineButton>
                        <OrangeButton className="flex-1 px-2 py-2 text-xs">Book Now</OrangeButton>
                      </div>
                      <a href={`/hospitals/${h.slug}`} className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-brand-orange hover:underline">
                        View Details <ArrowRight className="h-3 w-3" />
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
