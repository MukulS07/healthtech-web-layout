import { createFileRoute } from "@tanstack/react-router";
import { MapPin, ArrowRight } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow } from "@/components/home/primitives";

const cities = [
  { name: "Delhi NCR", slug: "delhi-ncr", clinics: 8, doctors: 45, specialties: 13 },
  { name: "Mumbai", slug: "mumbai", clinics: 6, doctors: 38, specialties: 12 },
  { name: "Bangalore", slug: "bangalore", clinics: 7, doctors: 42, specialties: 13 },
  { name: "Hyderabad", slug: "hyderabad", clinics: 5, doctors: 31, specialties: 10 },
  { name: "Chennai", slug: "chennai", clinics: 4, doctors: 26, specialties: 9 },
  { name: "Pune", slug: "pune", clinics: 4, doctors: 24, specialties: 9 },
  { name: "Kolkata", slug: "kolkata", clinics: 3, doctors: 18, specialties: 8 },
  { name: "Ahmedabad", slug: "ahmedabad", clinics: 3, doctors: 17, specialties: 7 },
  { name: "Jaipur", slug: "jaipur", clinics: 2, doctors: 12, specialties: 6 },
  { name: "Lucknow", slug: "lucknow", clinics: 2, doctors: 11, specialties: 6 },
  { name: "Kochi", slug: "kochi", clinics: 2, doctors: 14, specialties: 7 },
  { name: "Indore", slug: "indore", clinics: 2, doctors: 10, specialties: 5 },
  { name: "Chandigarh", slug: "chandigarh", clinics: 2, doctors: 13, specialties: 6 },
  { name: "Nagpur", slug: "nagpur", clinics: 1, doctors: 8, specialties: 5 },
  { name: "Bhubaneswar", slug: "bhubaneswar", clinics: 1, doctors: 7, specialties: 4 },
  { name: "Coimbatore", slug: "coimbatore", clinics: 1, doctors: 9, specialties: 5 },
];

const bgGradients = [
  "from-blue-50 to-slate-50",
  "from-orange-50 to-amber-50",
  "from-green-50 to-teal-50",
  "from-purple-50 to-indigo-50",
];

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "Locations — Cities We Serve | Prime Care" },
      { name: "description", content: "Prime Care is available in 45+ cities across India. Find specialist surgeons and accredited hospitals near you." },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">45+ cities</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Find Care Near You</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Specialist surgeons, accredited hospitals and dedicated care coordinators across 45+ cities in India.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead
              eyebrow="Our presence"
              title="Cities We Serve"
              subtitle="Click any city to see the hospitals, clinics and doctors available there."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cities.map((city, i) => (
                <a
                  key={city.slug}
                  href={`/locations/${city.slug}`}
                  className={`group flex flex-col rounded-xl border border-border bg-gradient-to-br ${bgGradients[i % bgGradients.length]} p-5 transition-shadow hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-navy/10">
                      <MapPin className="h-5 w-5 text-navy" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-orange opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h2 className="mt-4 text-base font-bold text-navy">{city.name}</h2>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-brand-orange">{city.clinics}</p>
                      <p className="text-[10px] text-muted-foreground">Clinics</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-brand-orange">{city.doctors}</p>
                      <p className="text-[10px] text-muted-foreground">Doctors</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-brand-orange">{city.specialties}</p>
                      <p className="text-[10px] text-muted-foreground">Specialties</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-navy py-14">
          <Container className="text-center">
            <Eyebrow tone="light">Not seeing your city?</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-navy-foreground sm:text-3xl">We're Expanding Fast</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-navy-foreground/75">
              We're adding new cities every quarter. Share your location and we'll notify you when we arrive.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full max-w-xs rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-navy-foreground placeholder:text-navy-foreground/50 outline-none"
              />
              <button className="w-full rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white sm:w-auto">
                Notify Me
              </button>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
