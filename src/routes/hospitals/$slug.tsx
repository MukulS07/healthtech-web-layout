import { createFileRoute } from "@tanstack/react-router";
import { Star, MapPin, Phone, ShieldCheck, Clock, Bot, Sparkles } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, OutlineButton, Carousel, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";

type HospitalInfo = {
  name: string;
  city: string;
  address: string;
  rating: string;
  reviews: number;
  beds: number;
  founded: string;
  accreditations: string[];
  specialties: string[];
  facilities: { icon: React.ElementType; label: string }[];
  about: string;
  img: string;
};

import React from "react";

const hospitalData: Record<string, HospitalInfo> = {
  "sunrise-hospital": {
    name: "Prime Care Sunrise Hospital",
    city: "Hyderabad",
    address: "Plot 42, Madhapur Road, HITEC City, Hyderabad – 500081",
    rating: "4.9",
    reviews: 1840,
    beds: 120,
    founded: "2014",
    accreditations: ["NABH", "ISO 9001:2015"],
    specialties: ["Proctology", "Urology", "Orthopedics", "Laparoscopy", "ENT"],
    facilities: [
      { icon: ShieldCheck, label: "NABH Accredited" },
      { icon: Clock, label: "24/7 Emergency" },
      { icon: Bot, label: "Robotic Surgery" },
      { icon: Sparkles, label: "Zero Infection" },
    ],
    about: "Prime Care Sunrise Hospital is a multi-specialty surgical facility in HITEC City, Hyderabad. With 120 beds, 8 modular OTs and a dedicated ICU, it is one of the most advanced day-care surgical centres in South India. The hospital has a NABH accreditation and maintains a zero-infection track record across its surgical suites.",
    img: hospital1,
  },
};

const fallbackHospital: HospitalInfo = {
  name: "Prime Care Hospital",
  city: "India",
  address: "Main Road, City Centre – 100001",
  rating: "4.7",
  reviews: 560,
  beds: 80,
  founded: "2015",
  accreditations: ["NABH"],
  specialties: ["General Surgery", "Orthopaedics", "Gynaecology"],
  facilities: [
    { icon: ShieldCheck, label: "NABH Accredited" },
    { icon: Clock, label: "24/7 Emergency" },
    { icon: Bot, label: "Laparoscopic Suite" },
    { icon: Sparkles, label: "Zero Infection" },
  ],
  about: "A modern multi-specialty surgical centre with advanced equipment, experienced surgeons and a strong commitment to patient safety and comfort.",
  img: hospital2,
};

const doctors = [
  { name: "Dr. Karan Mehta", cat: "Laparoscopic Surgeon", exp: "11 Years", rating: "4.9", img: doctor3 },
  { name: "Dr. Pradeep Dutta", cat: "General Surgeon", exp: "27 Years", rating: "4.5", img: doctor2 },
  { name: "Dr. Ananya Rao", cat: "Gynaecologist", exp: "14 Years", rating: "4.8", img: doctor1 },
];

export const Route = createFileRoute("/hospitals/$slug")({
  head: ({ params }) => {
    const data = hospitalData[params.slug] ?? fallbackHospital;
    return {
      meta: [
        { title: `${data.name} — ${data.city} | Prime Care` },
        { name: "description", content: `${data.name} in ${data.city}. ${data.accreditations.join(", ")} accredited. ${data.beds} beds, advanced surgical suites.` },
      ],
    };
  },
  component: HospitalDetail,
});

function HospitalDetail() {
  const { slug } = Route.useParams();
  const data = hospitalData[slug] ?? fallbackHospital;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">Home</a>
            <span>/</span>
            <a href="/hospitals" className="hover:text-brand-orange">Hospitals</a>
            <span>/</span>
            <span className="font-medium text-ink">{data.name}</span>
          </Container>
        </nav>

        {/* Hero image */}
        <div className="relative h-64 sm:h-80 lg:h-96">
          <img src={data.img} alt={data.name} loading="lazy" width={1400} height={600} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy/50" />
          <div className="absolute inset-0 flex items-end">
            <Container className="pb-8">
              <div className="flex flex-wrap items-center gap-2">
                {data.accreditations.map((a) => (
                  <span key={a} className="rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">{a}</span>
                ))}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{data.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="h-4 w-4" /> {data.city}
              </p>
            </Container>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-b border-border bg-cream">
          <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                <Star className="h-4 w-4 fill-brand-orange text-brand-orange" /> {data.rating} ({data.reviews} reviews)
              </span>
              <span className="text-sm text-muted-foreground">{data.beds} Beds</span>
              <span className="text-sm text-muted-foreground">Est. {data.founded}</span>
            </div>
            <div className="flex gap-2">
              <OutlineButton className="px-3 py-2 text-xs">Get Directions</OutlineButton>
              <OrangeButton className="px-3 py-2 text-xs">Book Now</OrangeButton>
            </div>
          </Container>
        </div>

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="min-w-0 space-y-12">
            <section>
              <h2 className="text-xl font-bold text-navy">About the Hospital</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{data.about}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Facilities & Standards</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {data.facilities.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 rounded-lg border border-border bg-cream px-4 py-3">
                    <f.icon className="h-5 w-5 shrink-0 text-brand-orange" />
                    <span className="text-sm font-medium text-ink">{f.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Specialties Available</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.specialties.map((s) => (
                  <a
                    key={s}
                    href={`/specialities/${s.toLowerCase()}`}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:border-brand-orange hover:text-brand-orange"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </section>

            <section>
              <SectionHead
                eyebrow="Meet the team"
                title="Doctors at This Hospital"
                action={<OutlineButton>View All</OutlineButton>}
              />
              <Carousel>
                {doctors.map((d) => (
                  <article key={d.name} className="w-[220px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background sm:w-[260px]">
                    <div className="relative">
                      <img src={d.img} alt={d.name} loading="lazy" width={700} height={700} className="h-44 w-full object-cover" />
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                        <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {d.rating}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="truncate text-sm font-bold text-navy">{d.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d.cat}</p>
                      <p className="mt-1.5 text-xs font-semibold text-brand-blue">{d.exp} Experience</p>
                      <div className="mt-3 flex gap-2">
                        <OutlineButton className="flex-1 px-2 py-1.5 text-xs"><Phone className="h-3 w-3" /> Call</OutlineButton>
                        <OrangeButton className="flex-1 px-2 py-1.5 text-xs">Book</OrangeButton>
                      </div>
                    </div>
                  </article>
                ))}
              </Carousel>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Location</h2>
              <div className="mt-4 rounded-xl border border-border bg-cream p-5">
                <p className="flex items-start gap-2 text-sm text-ink/80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" /> {data.address}
                </p>
                <div className="mt-4 flex gap-3">
                  <OrangeButton className="text-xs">Get Directions</OrangeButton>
                  <OutlineButton className="text-xs"><Phone className="h-3 w-3" /> Call Hospital</OutlineButton>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ConsultForm />
            <div className="mt-4 rounded-lg border border-border bg-cream p-4 text-xs text-muted-foreground">
              <Eyebrow>Emergency</Eyebrow>
              <p className="mt-2 text-sm font-semibold text-navy">24/7 Emergency Line</p>
              <a href="tel:18000001234" className="mt-1 flex items-center gap-2 text-sm font-bold text-brand-orange">
                <Phone className="h-4 w-4" /> 1800 000 1234
              </a>
            </div>
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
