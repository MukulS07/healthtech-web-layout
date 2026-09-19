import { useState } from "react";
import {
  ArrowRight,
  Play,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Bot,
  Sparkles,
  Search,
  ChevronDown,
  Quote,
  Phone,
  Apple,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import {
  Container,
  SectionHead,
  OrangeButton,
  OutlineButton,
  Carousel,
  Eyebrow,
} from "./primitives";
import { ConsultForm } from "./ConsultForm";
import tileProctology from "@/assets/tile-proctology.jpg";
import tileLaparoscopy from "@/assets/tile-laparoscopy.jpg";
import tileOrtho from "@/assets/tile-ortho.jpg";
import tileAesthetics from "@/assets/tile-aesthetics.jpg";
import expPre from "@/assets/exp-pre.jpg";
import expDuring from "@/assets/exp-during.jpg";
import expRecovery from "@/assets/exp-recovery.jpg";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";
import appMockup from "@/assets/app-mockup.png";

/* ---------------- Find care ---------------- */

const tabs = ["Specialities", "Treatments", "Conditions"] as const;

const tiles = [
  { label: "Proctology", title: "Piles, Fissure & Fistula", img: tileProctology, href: "/specialities/proctology" },
  { label: "Laparoscopy", title: "Hernia & Gallstone Surgery", img: tileLaparoscopy, href: "/specialities/laparoscopy" },
  { label: "Orthopedics", title: "Knee & Joint Replacement", img: tileOrtho, href: "/specialities/orthopedics" },
  { label: "Aesthetics", title: "Cosmetic & Skin Procedures", img: tileAesthetics, href: "/specialities/aesthetics" },
];

export function FindCare() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Specialities");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTiles = tiles.filter(t => 
    !searchTerm || 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow="Care near you"
          title={
            <>
              Explore Care That <span className="text-primary">Fits Your Needs</span>
            </>
          }
          subtitle="Browse trusted specialists, treatments and support for every stage of health."
        />
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-cream/80 p-2 shadow-sm sm:flex sm:items-center sm:gap-2">
          <div className="flex shrink-0 gap-1 rounded-xl bg-background/90 p-1">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  tab === t
                    ? "bg-navy text-navy-foreground shadow-sm"
                    : "text-muted-foreground hover:text-navy"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-1 items-center gap-2 px-3 py-1.5 sm:mt-0">
            <Search className="h-4 w-4 shrink-0 text-brand-orange" />
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
              placeholder={`Search ${tab.toLowerCase()} — e.g. piles, hernia, cataract`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button 
              type="button" 
              onClick={() => setSearchTerm("")}
              className="text-xs text-muted-foreground hover:text-navy px-2 hidden sm:block"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredTiles.map((tile) => (
            <a
              href={tile.href}
              key={tile.label}
              className="group relative overflow-hidden rounded-xl border border-border/80 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img
                src={tile.img}
                alt={tile.title}
                loading="lazy"
                width={800}
                height={1000}
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-lg bg-background/95 p-3.5 shadow-lg backdrop-blur-md transition-all group-hover:bg-background">
                <div className="flex items-center justify-between">
                  <Eyebrow tone="orange">{tile.label}</Eyebrow>
                  <ArrowRight className="h-4 w-4 text-brand-orange transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-1 text-sm font-bold text-navy">{tile.title}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a href="/specialities/proctology">
            <OutlineButton className="inline-flex items-center gap-2 text-sm font-semibold">
              View All 20+ Specialities <ArrowRight className="h-4 w-4 text-brand-orange" />
            </OutlineButton>
          </a>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Patient experiences ---------------- */

const experiences = [
  {
    tag: "Pre Surgery",
    img: expPre,
    points: [
      "Easy appointment booking & quick consultation",
      "Detailed diagnosis with expert surgeons",
      "Personalized treatment plan explained clearly",
      "Zero paperwork hassle – we manage everything",
    ],
  },
  {
    tag: "During Surgery",
    img: expDuring,
    points: [
      "Advanced minimally invasive procedures",
      "Experienced surgeons with modern technology",
      "High precision & safety-first protocols",
      "Seamless hospital experience with guided support",
    ],
  },
  {
    tag: "Recovery",
    img: expRecovery,
    points: [
      "Express discharge – faster return home",
      "Free drop facility after discharge",
      "Free post-surgery follow-up consultation",
      "24x7 assistance for any queries",
    ],
  },
];

export function PatientExperiences() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow="What care feels like"
          title="Support Before, During & After Treatment"
          subtitle="A coordinated experience designed around comfort, clarity and recovery."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {experiences.map((exp) => (
            <article
              key={exp.tag}
              className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={exp.img}
                  alt={exp.tag}
                  loading="lazy"
                  width={800}
                  height={900}
                  className="h-56 w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-navy-foreground shadow-sm">
                  {exp.tag}
                </span>
                <button
                  type="button"
                  className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-background/95 px-3.5 py-1.5 text-xs font-semibold text-navy shadow-md backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
                  aria-label={`Watch ${exp.tag} video`}
                >
                  <Play className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                  <span>Watch video</span>
                </button>
              </div>
              <ul className="flex-1 space-y-2.5 p-5">
                {exp.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Hospitals ---------------- */

const hospitalFeatures = [
  { icon: ShieldCheck, label: "NABH Accredited Facilities" },
  { icon: Clock, label: "24/7 Emergency Services" },
  { icon: Bot, label: "Advanced Robotic Surgery" },
  { icon: Sparkles, label: "Zero Infection Protocols" },
];

const hospitalImages = [hospital1, hospital2];

export interface HomeHospital {
  id: string;
  name: string;
  slug: string;
  city: string;
  rating: string | null;
  img: string;
}

export function Hospitals({ hospitals }: { hospitals: HomeHospital[] }) {
  if (!hospitals.length) return null;
  return (
    <section className="bg-navy py-12 sm:py-16 text-navy-foreground">
      <Container>
        <SectionHead
          tone="light"
          eyebrow="Care close to home"
          title="A Trusted Network of Modern Hospitals"
          subtitle="Accredited facilities, thoughtful teams and dependable support when it matters."
          action={
            <a href="/hospitals">
              <OutlineButton tone="light">Explore All Hospitals</OutlineButton>
            </a>
          }
        />
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hospitalFeatures.map((f) => (
            <div
              key={f.label}
              className="flex min-w-0 items-center gap-3 rounded-lg bg-navy-foreground/10 px-4 py-3 text-navy-foreground"
            >
              <f.icon className="h-5 w-5 shrink-0 text-brand-orange" />
              <span className="truncate text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>
        <Carousel>
          {hospitals.map((h, i) => (
            <article
              key={h.id || i}
              className="flex flex-col justify-between w-[280px] shrink-0 snap-start overflow-hidden rounded-xl bg-background text-ink shadow-md sm:w-[320px]"
            >
              <div>
                <div className="relative">
                  <img
                    src={h.img || hospitalImages[i % hospitalImages.length]}
                    alt={h.name}
                    loading="lazy"
                    width={900}
                    height={600}
                    className="h-44 w-full object-cover"
                  />
                  {h.rating && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {h.rating}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="truncate text-base font-bold text-navy">{h.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-brand-orange shrink-0" /> {h.city}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <a href={h.slug ? `/hospitals/${h.slug}` : "/hospitals"} className="flex-1">
                    <OutlineButton className="w-full justify-center px-3 py-2 text-xs">Directions</OutlineButton>
                  </a>
                  <a href="/contact" className="flex-1">
                    <OrangeButton className="w-full justify-center px-3 py-2 text-xs">Book Now</OrangeButton>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

/* ---------------- Journey ---------------- */

const journey = [
  {
    title: "Expert Consultation & Insurance",
    desc: "Consult top specialists with cashless & EMI support.",
    chip: "Cashless & EMI",
  },
  {
    title: "Pre-Surgery Preparation",
    desc: "Personalized diet plans and medical checks before the procedure.",
    chip: "Personalized Care",
  },
  {
    title: "Free Pick-up & Drop",
    desc: "Comfortable and safe hospital travel arranged for you.",
    chip: "Free & Safe Travel",
  },
  {
    title: "Advanced Surgery Care",
    desc: "Expert surgeons with 24/7 care coordination throughout.",
    chip: "Expert & Trusted",
  },
  {
    title: "Smooth Discharge",
    desc: "Quick, hassle-free process with insurance support.",
    chip: "Hassle-free Process",
  },
  {
    title: "Recovery & Follow-Up",
    desc: "Home recovery guidance with free doctor follow-ups.",
    chip: "We Care Beyond Surgery",
  },
];

export function Journey() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow="Step by step"
          title="Your Journey to Recovery"
          subtitle="Six carefully managed steps, from first call to full recovery."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map((step, i) => (
            <article
              key={step.title}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-background p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground shadow-sm">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-navy">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
              <div className="mt-4 pt-2">
                <span className="inline-block rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy border border-navy/10">
                  {step.chip}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Doctors ---------------- */

const doctorImages = [doctor1, doctor2, doctor3];

export interface HomeDoctor {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  cred: string;
  exp: number;
  rating: string;
  img: string;
}

export function Doctors({ doctors }: { doctors: HomeDoctor[] }) {
  if (!doctors.length) return null;
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead
          eyebrow="Built by trusted hands"
          title={
            <>
              Meet Our <span className="text-brand-orange">Expert Surgeons</span>
            </>
          }
          subtitle="400+ specialists with an average of 10+ years of surgical experience."
          action={
            <a href="/doctors">
              <OutlineButton>View All Doctors</OutlineButton>
            </a>
          }
        />
        <Carousel>
          {doctors.map((d, i) => (
            <article
              key={d.id || i}
              className="flex flex-col justify-between w-[260px] shrink-0 snap-start overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm hover:shadow-md transition-shadow sm:w-[300px]"
            >
              <div>
                <div className="relative">
                  <img
                    src={d.img || doctorImages[i % doctorImages.length]}
                    alt={d.name}
                    loading="lazy"
                    width={700}
                    height={700}
                    className="h-56 w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-navy-foreground shadow-sm">
                    {d.specialty}
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {d.rating}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="truncate text-base font-bold text-navy">{d.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.cred}</p>
                  <p className="mt-2 text-xs font-semibold text-navy">{d.exp} Years Experience</p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <a href="tel:18000001234" className="flex-1">
                    <OutlineButton className="w-full justify-center px-3 py-2 text-xs">Call</OutlineButton>
                  </a>
                  <a href="/contact" className="flex-1">
                    <OrangeButton className="w-full justify-center px-3 py-2 text-xs">Book Now</OrangeButton>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

/* ---------------- Stats ---------------- */

const stats = [
  { value: "2M+", label: "Lives Touched" },
  { value: "800+", label: "Hospitals Connected" },
  { value: "45+", label: "Cities Covered" },
  { value: "400+", label: "Expert Surgeons" },
];

export function Stats() {
  return (
    <section className="bg-navy py-12">
      <Container className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-extrabold text-brand-orange sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm font-medium text-navy-foreground/80">{s.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}

/* ---------------- Insurance ---------------- */

const insurers = [
  "Star Health",
  "HDFC Ergo",
  "Care Health",
  "Bajaj Allianz",
  "ICICI Lombard",
  "TATA AIG",
  "Aditya Birla Health",
  "New India Assurance",
];

export function Insurance() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <Eyebrow>Cashless on 100+ insurers</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-navy sm:text-3xl lg:text-[34px]">
            Clear Insurance Support with <span className="text-primary">Fast Eligibility Help</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base">
            Our insurance desk helps with paperwork, pre-authorisation and claims so you can focus
            on your health. Flexible payment support is available when insurance does not apply.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/insurance-eligibility">
              <OrangeButton>Check Eligibility</OrangeButton>
            </a>
            <a href="tel:18000001234">
              <OutlineButton className="gap-2">
                <Phone className="h-4 w-4 text-brand-orange shrink-0" /> Insurance Desk
              </OutlineButton>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {insurers.map((i) => (
            <div
              key={i}
              className="grid h-20 place-items-center rounded-xl border border-border bg-cream/70 px-2 text-center text-xs font-semibold text-navy shadow-xs"
            >
              {i}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */

export interface HomeTestimonial {
  id: string;
  comment: string;
  patientName: string;
  city: string;
  treatment: string;
}

export function Testimonials({ testimonials }: { testimonials: HomeTestimonial[] }) {
  if (!testimonials.length) return null;
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead align="center" eyebrow="Patient stories" title="What Our Patients Say" />
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((t) => (
            <article key={t.id} className="flex flex-col justify-between rounded-xl border border-border/80 bg-background p-6 shadow-sm">
              <div>
                <Quote className="h-7 w-7 text-brand-orange" />
                <p className="mt-4 text-sm italic text-muted-foreground leading-relaxed line-clamp-4">
                  "{t.comment}"
                </p>
              </div>
              <p className="mt-6 text-sm font-semibold text-navy">
                — {t.patientName}
                {[t.treatment, t.city].filter(Boolean).length > 0
                  ? `, ${[t.treatment, t.city].filter(Boolean).join(" · ")}`
                  : ""}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- About + sticky form ---------------- */

export function About() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="min-w-0">
          <Eyebrow>About us</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">About Go Surgery</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Go Surgery is a connected health network bringing patients, specialists, accredited
              hospitals and insurance partners together across 45+ cities.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <strong className="font-semibold text-navy">Pan-India Connected Care:</strong>{" "}
                  Seamless access to top accredited hospitals and 400+ expert surgeons across 45+
                  cities.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <strong className="font-semibold text-navy">Dedicated Care Coordinator:</strong>{" "}
                  Single point of contact guiding you from initial diagnosis through discharge and
                  recovery.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <strong className="font-semibold text-navy">Transparent & Supportive:</strong>{" "}
                  Zero-paperwork cashless claims, 2M+ lives touched, and 4.8/5 average patient
                  rating.
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="lg:sticky lg:top-36 lg:self-start">
          <ConsultForm />
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Healthfeed ---------------- */

const posts = [
  { cat: "Proctology", title: "Piles: when surgery is the right choice", read: "5 min read" },
  {
    cat: "Recovery",
    title: "What to eat in the first week after hernia surgery",
    read: "4 min read",
  },
  { cat: "Insurance", title: "How cashless surgery approval actually works", read: "6 min read" },
  {
    cat: "Orthopedics",
    title: "Knee replacement: myths patients still believe",
    read: "7 min read",
  },
];

export function Healthfeed() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead
          eyebrow="Health Guides & Articles"
          title="Read, Learn & Decide Better"
          subtitle="Doctor-reviewed guides on treatments, recovery and insurance."
          action={
            <a href="/blog">
              <OutlineButton>View All Articles</OutlineButton>
            </a>
          }
        />
        <Carousel>
          {posts.map((p) => (
            <article
              key={p.title}
              className="flex w-[260px] shrink-0 snap-start flex-col justify-between rounded-xl border border-border/80 bg-background p-5 shadow-sm sm:w-[300px]"
            >
              <div>
                <span className="w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
                  {p.cat}
                </span>
                <h3 className="mt-4 text-base font-bold leading-snug text-navy">{p.title}</h3>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">{p.read}</p>
            </article>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const faqs = [
  {
    q: "Is the consultation really free?",
    a: "Yes. Your first consultation with our specialist, including diagnosis discussion and treatment planning, is completely free.",
  },
  {
    q: "Will my insurance cover the surgery?",
    a: "We are cashless on 100+ insurers. Share your policy details and our insurance desk confirms coverage, usually within 30 minutes.",
  },
  {
    q: "How long does recovery take?",
    a: "Most minimally invasive procedures allow discharge within 24 hours and a return to routine activity in 3 to 7 days.",
  },
  {
    q: "Do you arrange transport to the hospital?",
    a: "Yes. Free pick-up and drop is arranged on the day of surgery and after discharge in all serviceable cities.",
  },
  {
    q: "What if I need help after discharge?",
    a: "Your care coordinator stays available 24x7, and post-surgery follow-up consultations with your surgeon are free.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container className="max-w-3xl">
        <SectionHead align="center" eyebrow="Good to know" title="Frequently Asked Questions" />
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-xl border border-border/80 bg-cream/70">
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              >
                <span className="text-sm font-semibold text-navy">{f.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-brand-orange transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i ? (
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-150">
                  {f.a}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- App download ---------------- */

export function DownloadApp() {
  return (
    <section className="bg-navy py-12 sm:py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0 text-navy-foreground">
          <Eyebrow tone="light">Go Surgery app</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl lg:text-[34px]">
            Track Your Surgery Journey <span className="text-brand-orange">On Your Phone</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm text-navy-foreground/85 leading-relaxed sm:text-base">
            Book consultations, upload reports, follow insurance status and chat with your care
            coordinator — all in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-navy hover:bg-cream transition-colors cursor-pointer"
            >
              <Apple className="h-5 w-5 text-primary" /> App Store
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-navy hover:bg-cream transition-colors cursor-pointer"
            >
              <Smartphone className="h-5 w-5 text-emerald-600" /> Google Play
            </button>
          </div>
        </div>
        <img
          src={appMockup}
          alt="Go Surgery mobile app screens"
          loading="lazy"
          width={1000}
          height={800}
          className="w-full max-w-lg justify-self-center object-contain"
        />
      </Container>
    </section>
  );
}
