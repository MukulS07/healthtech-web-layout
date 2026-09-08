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
} from "lucide-react";
import { Container, SectionHead, OrangeButton, OutlineButton, Carousel, Eyebrow } from "./primitives";
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
  { label: "Proctology", title: "Piles, Fissure & Fistula", img: tileProctology },
  { label: "Laparoscopy", title: "Hernia & Gallstone Surgery", img: tileLaparoscopy },
  { label: "Orthopedics", title: "Knee & Joint Replacement", img: tileOrtho },
  { label: "Aesthetics", title: "Cosmetic & Skin Procedures", img: tileAesthetics },
];

export function FindCare() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Specialities");
  return (
    <section className="bg-background py-14">
      <Container>
        <SectionHead
          align="center"
          eyebrow="Care near you"
          title={
            <>
              Find Specialized Care <span className="text-brand-orange">Near You</span>
            </>
          }
          subtitle="Specialized care for 50+ diseases with advanced technology and faster recovery."
        />
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto flex w-fit gap-1 rounded-full bg-cream p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === t ? "bg-navy text-navy-foreground" : "text-ink/70 hover:text-navy"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-brand-orange" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder={`Search ${tab.toLowerCase()} — e.g. piles, hernia, cataract`}
            />
            <OrangeButton className="hidden px-4 py-2 sm:inline-flex">Search</OrangeButton>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <article key={tile.label} className="group relative overflow-hidden rounded-2xl">
              <img
                src={tile.img}
                alt={tile.title}
                loading="lazy"
                width={800}
                height={1000}
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.195_0.042_233_/_0.92),transparent_60%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <Eyebrow tone="orange">{tile.label}</Eyebrow>
                <p className="mt-1 text-lg font-bold text-navy-foreground">{tile.title}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
            View All 20+ Specialities <ArrowRight className="h-4 w-4" />
          </button>
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
    <section className="bg-cream py-14">
      <Container>
        <SectionHead
          align="center"
          eyebrow="Voices of recovery"
          title="Patient Experiences"
          subtitle="Real stories of transformation and healing."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {experiences.map((exp) => (
            <article key={exp.tag} className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="relative">
                <img
                  src={exp.img}
                  alt={exp.tag}
                  loading="lazy"
                  width={800}
                  height={900}
                  className="h-56 w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy-foreground">
                  {exp.tag}
                </span>
                <button className="absolute inset-0 grid place-items-center" aria-label="Watch video">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-background/90 text-brand-orange shadow-lg">
                    <Play className="h-6 w-6 fill-brand-orange" />
                  </span>
                </button>
              </div>
              <ul className="space-y-2 p-5">
                {exp.points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-ink/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    {p}
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

const hospitals = [
  { name: "Prime Care Sunrise Hospital", city: "Hyderabad", rating: "4.9", img: hospital1 },
  { name: "Prime Care Meridian Centre", city: "Gurgaon", rating: "4.8", img: hospital2 },
  { name: "Prime Care Lakeview Hospital", city: "Kochi", rating: "4.7", img: hospital1 },
  { name: "Prime Care City Institute", city: "Delhi", rating: "4.6", img: hospital2 },
];

export function Hospitals() {
  return (
    <section className="bg-[linear-gradient(120deg,var(--brand-blue-dark),var(--brand-blue))] py-14">
      <Container>
        <SectionHead
          tone="light"
          eyebrow="End-to-end excellence"
          title="Prime Super Specialty Hospitals"
          subtitle="Modern infrastructure, accredited facilities and surgeons you can trust."
          action={<OutlineButton tone="light">Explore All Hospitals</OutlineButton>}
        />
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hospitalFeatures.map((f) => (
            <div
              key={f.label}
              className="flex min-w-0 items-center gap-3 rounded-xl bg-navy-foreground/10 px-4 py-3 text-navy-foreground"
            >
              <f.icon className="h-5 w-5 shrink-0 text-brand-orange" />
              <span className="truncate text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>
        <Carousel>
          {hospitals.map((h, i) => (
            <article
              key={i}
              className="w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl bg-background sm:w-[320px]"
            >
              <div className="relative">
                <img
                  src={h.img}
                  alt={h.name}
                  loading="lazy"
                  width={900}
                  height={600}
                  className="h-44 w-full object-cover"
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                  <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {h.rating}
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate text-base font-bold text-navy">{h.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {h.city}
                </p>
                <div className="mt-4 flex gap-2">
                  <OutlineButton className="flex-1 px-3 py-2 text-xs">Get Directions</OutlineButton>
                  <OrangeButton className="flex-1 px-3 py-2 text-xs">Book Now</OrangeButton>
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
  { title: "Expert Consultation & Insurance", desc: "Consult top specialists with cashless & EMI support.", chip: "Cashless & EMI" },
  { title: "Pre-Surgery Preparation", desc: "Personalized diet plans and medical checks before the procedure.", chip: "Personalized Care" },
  { title: "Free Pick-up & Drop", desc: "Comfortable and safe hospital travel arranged for you.", chip: "Free & Safe Travel" },
  { title: "Advanced Surgery Care", desc: "Expert surgeons with 24/7 care coordination throughout.", chip: "Expert & Trusted" },
  { title: "Smooth Discharge", desc: "Quick, hassle-free process with insurance support.", chip: "Hassle-free Process" },
  { title: "Recovery & Follow-Up", desc: "Home recovery guidance with free doctor follow-ups.", chip: "We Care Beyond Surgery" },
];

export function Journey() {
  return (
    <section className="bg-background py-14">
      <Container>
        <SectionHead
          align="center"
          eyebrow="Step by step"
          title="Your Journey to Recovery"
          subtitle="Six carefully managed steps, from first call to full recovery."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map((step, i) => (
            <article key={step.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
              <span className="mt-4 inline-block rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-semibold text-brand-orange-dark">
                {step.chip}
              </span>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Doctors ---------------- */

const doctors = [
  { name: "Dr. Ananya Rao", cat: "Gynecologist", cred: "MBBS, MS (Obstetrics & Gynaecology)", exp: "14 Years", rating: "4.8", img: doctor1 },
  { name: "Dr. Pradeep Dutta", cat: "General Medicine", cred: "MBBS, MD (Respiratory Medicine)", exp: "27 Years", rating: "4.5", img: doctor2 },
  { name: "Dr. Karan Mehta", cat: "Laparoscopic Surgeon", cred: "MBBS, MS (General Surgery)", exp: "11 Years", rating: "4.9", img: doctor3 },
  { name: "Dr. Sunita Narang", cat: "Eye Specialist", cred: "MBBS, MS (Ophthalmology)", exp: "18 Years", rating: "4.7", img: doctor1 },
];

export function Doctors() {
  return (
    <section className="bg-cream py-14">
      <Container>
        <SectionHead
          eyebrow="Built by trusted hands"
          title={
            <>
              Meet Our <span className="text-brand-orange">Expert Surgeons</span>
            </>
          }
          subtitle="400+ specialists with an average of 10+ years of surgical experience."
          action={<OutlineButton>View All Doctors</OutlineButton>}
        />
        <Carousel>
          {doctors.map((d, i) => (
            <article
              key={i}
              className="w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-background sm:w-[300px]"
            >
              <div className="relative">
                <img
                  src={d.img}
                  alt={d.name}
                  loading="lazy"
                  width={700}
                  height={700}
                  className="h-56 w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">
                  {d.cat}
                </span>
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                  <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {d.rating}
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate text-base font-bold text-navy">{d.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.cred}</p>
                <p className="mt-2 text-xs font-semibold text-brand-blue">{d.exp} Experience</p>
                <div className="mt-4 flex gap-2">
                  <OutlineButton className="flex-1 px-3 py-2 text-xs">Call</OutlineButton>
                  <OrangeButton className="flex-1 px-3 py-2 text-xs">Book Now</OrangeButton>
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
            <p className="mt-1 text-sm text-navy-foreground/80">{s.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}

/* ---------------- Insurance ---------------- */

const insurers = ["StarShield", "CareFirst", "NivaHealth", "BajajSecure", "HDFC Ergo", "ICICI Lombard", "TATA AIG", "Aditya Health"];

export function Insurance() {
  return (
    <section className="bg-background py-14">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <Eyebrow>Cashless on 100+ insurers</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-navy sm:text-3xl lg:text-[34px]">
            Cashless Surgery with <span className="text-brand-orange">30-Minute Approval</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Our insurance desk handles paperwork, pre-authorisation and claims so you can focus only on getting
            better. No-cost EMI available if you are not insured.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <OrangeButton>Check Eligibility</OrangeButton>
            <OutlineButton>
              <Phone className="h-4 w-4" /> Talk to Insurance Desk
            </OutlineButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {insurers.map((i) => (
            <div
              key={i}
              className="grid h-20 place-items-center rounded-xl border border-border bg-cream px-2 text-center text-xs font-semibold text-navy"
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

const testimonials = [
  { quote: "From booking to discharge everything was handled. I was back at work in four days.", name: "Rohan M., Bangalore" },
  { quote: "The insurance approval came through in under an hour. Zero paperwork for my family.", name: "Kavita S., Pune" },
  { quote: "My surgeon explained every step calmly. The follow-up calls really mattered.", name: "Imran A., Hyderabad" },
];

export function Testimonials() {
  return (
    <section className="bg-cream py-14">
      <Container>
        <SectionHead align="center" eyebrow="Patient stories" title="What Our Patients Say" />
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((t) => (
            <article key={t.name} className="rounded-2xl border border-border bg-background p-6">
              <Quote className="h-7 w-7 text-brand-orange" />
              <p className="mt-4 text-sm italic text-ink/80">"{t.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-navy">— {t.name}</p>
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
    <section className="bg-background py-14">
      <Container className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="min-w-0">
          <Eyebrow>About us</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">About Prime Care</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Prime Care is a surgical care network connecting patients with specialist surgeons, accredited
              hospitals and insurance partners across 45+ cities. We handle the parts of surgery that usually
              cause the most stress — finding the right doctor, understanding costs, insurance paperwork,
              hospital admission and recovery support.
            </p>
            <p>
              Every patient is assigned a dedicated care coordinator who stays with them from the first free
              consultation until the final follow-up. Our surgeons use minimally invasive, USFDA-approved
              techniques that mean smaller cuts, less pain and a faster return to normal life.
            </p>
            <p>
              With 2M+ lives touched and a 4.8/5 average patient rating, our focus stays simple: safer surgeries,
              transparent pricing and care that continues well beyond the operating room.
            </p>
          </div>
        </div>
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ConsultForm />
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Healthfeed ---------------- */

const posts = [
  { cat: "Proctology", title: "Piles: when surgery is the right choice", read: "5 min read" },
  { cat: "Recovery", title: "What to eat in the first week after hernia surgery", read: "4 min read" },
  { cat: "Insurance", title: "How cashless surgery approval actually works", read: "6 min read" },
  { cat: "Orthopedics", title: "Knee replacement: myths patients still believe", read: "7 min read" },
];

export function Healthfeed() {
  return (
    <section className="bg-cream py-14">
      <Container>
        <SectionHead
          eyebrow="Healthfeed"
          title="Read, Learn & Decide Better"
          subtitle="Doctor-reviewed guides on treatments, recovery and insurance."
          action={<OutlineButton>View All Articles</OutlineButton>}
        />
        <Carousel>
          {posts.map((p) => (
            <article
              key={p.title}
              className="flex w-[260px] shrink-0 snap-start flex-col rounded-2xl border border-border bg-background p-5 sm:w-[300px]"
            >
              <span className="w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
                {p.cat}
              </span>
              <h3 className="mt-4 text-base font-bold leading-snug text-navy">{p.title}</h3>
              <p className="mt-auto pt-6 text-xs text-muted-foreground">{p.read}</p>
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
    <section className="bg-background py-14">
      <Container className="max-w-3xl">
        <SectionHead align="center" eyebrow="Good to know" title="Frequently Asked Questions" />
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-cream">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-navy">{f.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-brand-orange transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i ? <p className="px-5 pb-4 text-sm text-muted-foreground">{f.a}</p> : null}
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
    <section className="bg-[linear-gradient(120deg,var(--brand-blue-dark),var(--brand-blue))] py-14">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0 text-navy-foreground">
          <Eyebrow tone="light">Prime Care app</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl lg:text-[34px]">
            Track Your Surgery Journey <span className="text-brand-orange">On Your Phone</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm text-navy-foreground/85 sm:text-base">
            Book consultations, upload reports, follow insurance status and chat with your care coordinator —
            all in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-navy">
              <Apple className="h-5 w-5" /> App Store
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-navy">
              <Smartphone className="h-5 w-5" /> Google Play
            </button>
          </div>
        </div>
        <img
          src={appMockup}
          alt="Prime Care mobile app screens"
          loading="lazy"
          width={1000}
          height={800}
          className="w-full max-w-lg justify-self-center object-contain"
        />
      </Container>
    </section>
  );
}
