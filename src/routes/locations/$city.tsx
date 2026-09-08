import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Star, Phone } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, OutlineButton, Carousel, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";

type CityInfo = {
  displayName: string;
  tagline: string;
  clinics: number;
  doctors: number;
  specialties: string[];
  hospitals: { name: string; slug: string; rating: string; address: string; img: typeof hospital1 }[];
  doctors_list: { name: string; slug: string; specialty: string; exp: string; rating: string; img: typeof doctor1 }[];
};

const cityData: Record<string, CityInfo> = {
  "delhi-ncr": {
    displayName: "Delhi NCR",
    tagline: "Specialist surgical care across Delhi, Gurgaon, Noida and Faridabad.",
    clinics: 8,
    doctors: 45,
    specialties: ["Proctology", "Laparoscopy", "Gynaecology", "ENT", "Urology", "Orthopedics", "Ophthalmology", "Aesthetics", "Vascular", "Fertility", "Weight Loss", "Dermatology", "Ear Nose Throat"],
    hospitals: [
      { name: "Prime Care City Institute", slug: "city-institute", rating: "4.6", address: "Saket, South Delhi", img: hospital2 },
      { name: "Prime Care Gurgaon Meridian", slug: "meridian-centre", rating: "4.8", address: "DLF Cyber City, Gurgaon", img: hospital1 },
    ],
    doctors_list: [
      { name: "Dr. Alok Verma", slug: "dr-alok-verma", specialty: "Urologist", exp: "19 Years", rating: "4.9", img: doctor1 },
      { name: "Dr. Ananya Rao", slug: "dr-ananya-rao", specialty: "Gynaecologist", exp: "14 Years", rating: "4.8", img: doctor2 },
      { name: "Dr. Karan Mehta", slug: "dr-karan-mehta", specialty: "Laparoscopic Surgeon", exp: "11 Years", rating: "4.9", img: doctor3 },
    ],
  },
};

const fallbackCity: CityInfo = {
  displayName: "Your City",
  tagline: "Expert surgical care with top-rated specialists and accredited facilities.",
  clinics: 3,
  doctors: 15,
  specialties: ["Proctology", "Laparoscopy", "Gynaecology", "ENT", "Urology", "Orthopedics"],
  hospitals: [
    { name: "Prime Care Hospital", slug: "prime-care-hospital", rating: "4.7", address: "City Centre", img: hospital1 },
  ],
  doctors_list: [
    { name: "Dr. Specialist A", slug: "dr-specialist-a", specialty: "Surgeon", exp: "12 Years", rating: "4.7", img: doctor1 },
    { name: "Dr. Specialist B", slug: "dr-specialist-b", specialty: "Specialist", exp: "10 Years", rating: "4.8", img: doctor2 },
  ],
};

export const Route = createFileRoute("/locations/$city")({
  head: ({ params }) => {
    const data = cityData[params.city] ?? fallbackCity;
    return {
      meta: [
        { title: `Surgery & Specialist Doctors in ${data.displayName} | Prime Care` },
        { name: "description", content: `Find ${data.doctors}+ specialist surgeons and ${data.clinics} accredited hospitals in ${data.displayName}. Book a free consultation.` },
      ],
    };
  },
  component: CityPage,
});

function CityPage() {
  const { city } = Route.useParams();
  const data = cityData[city] ?? fallbackCity;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">Home</a>
            <span>/</span>
            <a href="/locations" className="hover:text-brand-orange">Locations</a>
            <span>/</span>
            <span className="font-medium text-ink">{data.displayName}</span>
          </Container>
        </nav>

        <section className="bg-navy py-14">
          <Container>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-orange" />
              <Eyebrow tone="light">Available in your city</Eyebrow>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Surgery & Specialist Doctors in {data.displayName}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">{data.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-6">
              {[{ value: data.clinics, label: "Clinics & Hospitals" }, { value: data.doctors, label: "Specialist Doctors" }, { value: data.specialties.length, label: "Specialties" }].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-brand-orange">{s.value}+</p>
                  <p className="mt-0.5 text-xs text-navy-foreground/70">{s.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Specialties */}
        <section className="border-b border-border bg-cream py-6">
          <Container>
            <p className="mb-3 text-sm font-semibold text-navy">Available Specialties</p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {data.specialties.map((s) => (
                <a
                  key={s}
                  href={`/specialities/${s.toLowerCase()}`}
                  className="shrink-0 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-ink/80 transition-colors hover:border-brand-orange hover:text-brand-orange"
                >
                  {s}
                </a>
              ))}
            </div>
          </Container>
        </section>

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="min-w-0 space-y-14">
            {/* Hospitals */}
            <section>
              <SectionHead
                eyebrow={`${data.clinics} locations`}
                title={`Hospitals & Clinics in ${data.displayName}`}
                action={<OutlineButton>View All</OutlineButton>}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                {data.hospitals.map((h) => (
                  <article key={h.slug} className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="relative">
                      <img src={h.img} alt={h.name} loading="lazy" width={900} height={600} className="h-40 w-full object-cover" />
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                        <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {h.rating}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-navy">{h.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {h.address}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <OutlineButton className="flex-1 px-2 py-2 text-xs">Directions</OutlineButton>
                        <OrangeButton className="flex-1 px-2 py-2 text-xs">Book Now</OrangeButton>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Doctors */}
            <section>
              <SectionHead
                eyebrow={`${data.doctors}+ specialists`}
                title={`Top Doctors in ${data.displayName}`}
                action={<a href="/doctors" className="text-sm font-semibold text-brand-orange hover:underline">View All Doctors</a>}
              />
              <Carousel>
                {data.doctors_list.map((d) => (
                  <article key={d.slug} className="w-[260px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background sm:w-[300px]">
                    <div className="relative">
                      <img src={d.img} alt={d.name} loading="lazy" width={700} height={700} className="h-52 w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">{d.specialty}</span>
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                        <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {d.rating}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="truncate text-sm font-bold text-navy">{d.name}</h3>
                      <p className="mt-1.5 text-xs font-semibold text-brand-blue">{d.exp} Experience</p>
                      <div className="mt-3 flex gap-2">
                        <OutlineButton className="flex-1 px-2 py-2 text-xs"><Phone className="h-3 w-3" /> Call</OutlineButton>
                        <OrangeButton className="flex-1 px-2 py-2 text-xs">Book</OrangeButton>
                      </div>
                    </div>
                  </article>
                ))}
              </Carousel>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ConsultForm />
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
