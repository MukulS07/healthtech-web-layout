import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Baby,
  Bone,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  HeartHandshake,
  HeartPulse,
  Loader2,
  MapPin,
  MessageCircle,
  PenLine,
  Phone,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import { Container, SectionHead, OrangeButton, OutlineButton, Carousel, Eyebrow } from "./primitives";
import { ConsultForm } from "./ConsultForm";
import { DoctorCard, type DoctorCardData } from "@/components/doctors/DoctorCard";
import tileProctology from "@/assets/tile-proctology.jpg";
import tileLaparoscopy from "@/assets/tile-laparoscopy.jpg";
import tileOrtho from "@/assets/tile-ortho.jpg";
import tileAesthetics from "@/assets/tile-aesthetics.jpg";
import expPre from "@/assets/exp-pre.jpg";
import expDuring from "@/assets/exp-during.jpg";
import expRecovery from "@/assets/exp-recovery.jpg";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";
import { CONDITIONS, SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { BLOG_POSTS } from "@/data/blog";
import { ENABLED_PROMISES, whatsappHref } from "@/lib/site";
import { roundDownPlus } from "@/lib/format";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import { subscribeFn } from "@/lib/server-functions/subscribers";
import type { SiteStats } from "@/lib/server-functions/site-stats";
import { cn } from "@/lib/utils";

/* ---------------- Find care ---------------- */

const tabs = ["Specialities", "Treatments", "Conditions"] as const;
type Tab = (typeof tabs)[number];

const featuredTiles = [
  { slug: "proctology", title: "Piles, Fissure & Fistula", img: tileProctology },
  { slug: "laparoscopy", title: "Hernia & Gallstone Surgery", img: tileLaparoscopy },
  { slug: "orthopaedics", title: "Knee & Joint Replacement", img: tileOrtho },
  { slug: "plastic-cosmetic-surgery", title: "Cosmetic & Reconstructive", img: tileAesthetics },
];

const POPULAR_TREATMENTS = [
  "laser-piles-surgery",
  "laparoscopic-cholecystectomy",
  "laparoscopic-hernia-repair",
  "phaco-cataract-surgery",
  "total-knee-replacement",
  "rirs",
  "circumcision",
  "fess",
  "lasik",
  "laser-fistula-surgery",
  "evla",
  "gynecomastia-surgery",
];

export function FindCare() {
  const [tab, setTab] = useState<Tab>("Specialities");
  const [searchTerm, setSearchTerm] = useState("");
  const term = searchTerm.trim().toLowerCase();

  const matches = (text: string) => !term || text.toLowerCase().includes(term);

  const items = useMemo(() => {
    if (tab === "Specialities") {
      return SPECIALITIES.filter((s) => matches(`${s.name} ${s.tagline}`)).map((s) => ({
        key: s.slug,
        href: `/specialities/${s.slug}`,
        title: s.name,
        sub: s.tagline,
      }));
    }
    if (tab === "Treatments") {
      const list = term
        ? TREATMENTS.filter((t) => matches(`${t.name} ${(t.aka ?? []).join(" ")}`))
        : POPULAR_TREATMENTS.map((slug) => TREATMENTS.find((t) => t.slug === slug)!).filter(Boolean);
      return list.map((t) => ({
        key: t.slug,
        href: `/treatments/${t.slug}`,
        title: t.name,
        sub: SPECIALITIES.find((s) => s.slug === t.speciality)?.name ?? "",
      }));
    }
    return CONDITIONS.filter((c) => matches(`${c.name} ${(c.aka ?? []).join(" ")}`))
      .slice(0, term ? 60 : 16)
      .map((c) => ({
        key: c.slug,
        href: `/conditions/${c.slug}`,
        title: c.name,
        sub: SPECIALITIES.find((s) => s.slug === c.speciality)?.name ?? "",
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, term]);

  const viewAll = {
    Specialities: { href: "/specialities", label: `View All ${SPECIALITIES.length} Specialities` },
    Treatments: { href: "/treatments", label: `View All ${TREATMENTS.length} Treatments` },
    Conditions: { href: "/conditions", label: `View All ${CONDITIONS.length} Conditions` },
  }[tab];

  return (
    <section id="specialities" className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow="Care near you"
          title={
            <>
              Explore Care That <span className="text-primary">Fits Your Needs</span>
            </>
          }
          subtitle="Browse by speciality, by treatment, or by the condition you're dealing with."
        />
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-cream/80 p-2 shadow-sm sm:flex sm:items-center sm:gap-2">
          <div role="tablist" className="flex shrink-0 gap-1 rounded-xl bg-background/90 p-1">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                  tab === t ? "bg-navy text-navy-foreground shadow-sm" : "text-muted-foreground hover:text-navy",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="mt-2 flex flex-1 items-center gap-2 px-3 py-1.5 sm:mt-0">
            <Search className="h-4 w-4 shrink-0 text-brand-orange" />
            <span className="sr-only">Search {tab.toLowerCase()}</span>
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
              placeholder={`Search ${tab.toLowerCase()} — e.g. piles, hernia, cataract`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        {tab === "Specialities" && !term ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTiles.map((tile) => {
              const spec = SPECIALITIES.find((s) => s.slug === tile.slug)!;
              return (
                <a
                  href={`/specialities/${tile.slug}`}
                  key={tile.slug}
                  className="group relative overflow-hidden rounded-xl border border-border/80 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img
                    src={tile.img}
                    alt={tile.title}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 rounded-lg bg-background/95 p-3.5 shadow-lg backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <Eyebrow tone="orange">{spec.name}</Eyebrow>
                      <ArrowRight className="h-4 w-4 text-brand-orange transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1 text-sm font-bold text-navy">{tile.title}</p>
                  </div>
                </a>
              );
            })}
          </div>
        ) : null}

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <a
              key={it.key}
              href={it.href}
              className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-cream/60 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-cream"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy">{it.title}</span>
                {it.sub ? <span className="block truncate text-xs text-muted-foreground">{it.sub}</span> : null}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
            </a>
          ))}
          {items.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
              Nothing matches “{searchTerm}”. Try another word, or{" "}
              <a href="/contact" className="font-semibold text-primary underline">
                ask our care team
              </a>
              .
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex justify-center">
          <a href={viewAll.href}>
            <OutlineButton className="inline-flex items-center gap-2 text-sm font-semibold">
              {viewAll.label} <ArrowRight className="h-4 w-4 text-brand-orange" />
            </OutlineButton>
          </a>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Specialised centres ---------------- */

const centres = [
  { name: "Women's Health", icon: Baby, desc: "Gynaecology, fibroids, endometriosis and fertility care.", slugs: ["gynaecology", "ivf-fertility"] },
  { name: "Bone & Joint", icon: Bone, desc: "Joint replacement, sports injuries and spine care.", slugs: ["orthopaedics", "spine-surgery"] },
  { name: "Digestive & Gut Health", icon: HeartPulse, desc: "Piles, fistula, gallstones, hernia, reflux and weight-loss surgery.", slugs: ["proctology", "laparoscopy", "gastrointestinal-surgery", "bariatric-surgery"] },
  { name: "Kidney & Urology", icon: ClipboardList, desc: "Kidney stones, prostate and urinary problems.", slugs: ["urology"] },
  { name: "Eye Care", icon: Eye, desc: "Cataract, LASIK, glaucoma and retina.", slugs: ["ophthalmology"] },
  { name: "Advanced Aesthetics", icon: Sparkles, desc: "Cosmetic, reconstructive and hair restoration.", slugs: ["plastic-cosmetic-surgery", "hair-transplant"] },
];

export function SpecialisedCentres() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow="Specialised centres"
          title="Care Organised Around What You Need"
          subtitle="Related specialities grouped together, so you can find the right team faster."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centres.map((c) => (
            <article key={c.name} className="flex flex-col rounded-xl border border-border/80 bg-background p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-orange-soft text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.slugs.map((slug) => {
                  const s = SPECIALITIES.find((x) => x.slug === slug);
                  return s ? (
                    <a
                      key={slug}
                      href={`/specialities/${slug}`}
                      className="rounded-full border border-border bg-cream px-3 py-1 text-xs font-semibold text-navy hover:border-primary/40"
                    >
                      {s.name}
                    </a>
                  ) : null;
                })}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Patient experiences ---------------- */

const experiences = [
  {
    tag: "Before surgery",
    img: expPre,
    points: [
      "A care coordinator listens to your symptoms and questions",
      "A consultation with a surgeon who explains every option",
      "A clear plan: tests needed, procedure, stay and recovery",
      "Help checking your insurance and payment options",
    ],
  },
  {
    tag: "On the day",
    img: expDuring,
    points: [
      "Admission steps explained in advance",
      "Your coordinator available to you and your family",
      "Updates for family members while you're in surgery",
      "Minimally invasive techniques where suitable",
    ],
  },
  {
    tag: "Recovery",
    img: expRecovery,
    points: [
      "Written discharge and recovery instructions",
      "Diet and activity guidance for the weeks ahead",
      "Help booking your follow-up review",
      "Someone to call if something doesn't feel right",
    ],
  },
];

export function PatientExperiences() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow="What care feels like"
          title="Support Before, During & After Treatment"
          subtitle="Surgery is stressful. Here's how we help at each stage."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {experiences.map((exp) => (
            <article key={exp.tag} className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm">
              <div className="relative">
                <img src={exp.img} alt={exp.tag} loading="lazy" width={800} height={900} className="h-52 w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-navy-foreground shadow-sm">
                  {exp.tag}
                </span>
              </div>
              <ul className="flex-1 space-y-2.5 p-5">
                {exp.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
    <section className="bg-navy py-12 text-navy-foreground sm:py-16">
      <Container>
        <SectionHead
          tone="light"
          eyebrow="Hospitals near you"
          title="Hospitals in Our Directory"
          subtitle="Browse hospitals and see which surgeons practise there. Ask our care team which options suit your treatment and insurance."
          action={
            <a href="/hospitals">
              <OutlineButton tone="light">Explore All Hospitals</OutlineButton>
            </a>
          }
        />
        <Carousel>
          {hospitals.map((h, i) => (
            <article
              key={h.id || i}
              className="flex w-[280px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl bg-background text-ink shadow-md sm:w-[320px]"
            >
              <a href={h.slug ? `/hospitals/${h.slug}` : "/hospitals"} className="block">
                <div className="relative">
                  <img
                    src={h.img || hospitalImages[i % hospitalImages.length]}
                    alt={h.name}
                    loading="lazy"
                    width={900}
                    height={600}
                    className="h-44 w-full object-cover"
                  />
                  {h.rating ? (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {h.rating}
                    </span>
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="truncate text-base font-bold text-navy">{h.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-orange" /> {h.city}
                  </p>
                </div>
              </a>
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <a href={h.slug ? `/hospitals/${h.slug}` : "/hospitals"} className="flex-1">
                    <OutlineButton className="w-full justify-center px-3 py-2 text-xs">View details</OutlineButton>
                  </a>
                  <a href={`/contact?city=${encodeURIComponent(h.city)}`} className="flex-1">
                    <OrangeButton className="w-full justify-center px-3 py-2 text-xs">Request consult</OrangeButton>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </Carousel>
        <p className="mt-6 text-[11px] text-navy-foreground/60">
          Hospital names and trademarks belong to their respective owners. A listing in our directory
          does not imply affiliation with or endorsement by the hospital.
        </p>
      </Container>
    </section>
  );
}

/* ---------------- Journey ---------------- */

const journey = [
  { icon: Phone, title: "Tell us what's going on", desc: "Fill in the form or call us. A care coordinator calls you back to understand your symptoms." },
  { icon: Stethoscope, title: "Meet the right surgeon", desc: "We suggest suitable specialists near you and book a consultation at a time that works." },
  { icon: ClipboardList, title: "Understand your plan", desc: "Your surgeon explains the diagnosis, options, risks, stay and recovery — so you can decide calmly." },
  { icon: Wallet, title: "Sort out payment", desc: "We check your insurance for cashless eligibility and explain EMI options if you need them." },
  { icon: HeartHandshake, title: "Surgery and recovery", desc: "Your coordinator stays in touch through admission, discharge and your follow-up review." },
];

export function Journey() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead align="center" eyebrow="How it works" title="From First Call to Recovery" subtitle="Five straightforward steps, with one person guiding you throughout." />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {journey.map((step, i) => (
            <li key={step.title} className="relative rounded-xl border border-border/80 bg-background p-5 shadow-sm">
              <span className="absolute right-4 top-4 text-3xl font-extrabold text-navy/10">{i + 1}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-navy-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ---------------- Doctors ---------------- */

export function Doctors({ doctors }: { doctors: DoctorCardData[] }) {
  if (!doctors.length) return null;
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          eyebrow="Our surgeons"
          title={
            <>
              Meet Surgeons <span className="text-brand-orange">Patients Recommend</span>
            </>
          }
          subtitle="Surgeons from our directory with the most patient reviews. See qualifications, experience and where they practise."
          action={
            <a href="/doctors">
              <OutlineButton>View All Doctors</OutlineButton>
            </a>
          }
        />
        <Carousel>
          {doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} className="w-[260px] shrink-0 snap-start sm:w-[290px]" />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

/* ---------------- Stats ---------------- */

export function Stats({ stats }: { stats: SiteStats | null }) {
  if (!stats || stats.surgeons === 0) return null;
  const items = [
    { value: roundDownPlus(stats.surgeons), label: "Surgeons in our directory" },
    { value: roundDownPlus(stats.hospitals), label: "Hospitals listed" },
    { value: String(stats.cities), label: "Cities covered" },
    ...(stats.reviews > 0 ? [{ value: roundDownPlus(stats.reviews), label: "Patient reviews" }] : []),
  ];
  return (
    <section className="bg-navy py-12">
      <Container className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
        {items.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-extrabold text-brand-orange sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm font-medium text-navy-foreground/80">{s.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}

/* ---------------- Benefits strip ---------------- */

export function Benefits() {
  if (!ENABLED_PROMISES.length) return null;
  return (
    <section className="border-y border-border bg-background py-8">
      <Container>
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-brand-orange">What every patient gets</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ENABLED_PROMISES.map((p) => (
            <li key={p.key} className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-navy">{p.title}</span>
                <span className="text-xs text-muted-foreground">{p.sub}</span>
              </span>
            </li>
          ))}
        </ul>
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
          <Eyebrow>Insurance & EMI</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-navy sm:text-3xl lg:text-[34px]">
            Help With Insurance, <span className="text-primary">So You Can Focus on Recovery</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Our team checks what your policy covers, helps with pre-authorisation paperwork and
            explains any out-of-pocket amount before you decide. If insurance doesn't apply, we can
            walk you through EMI options.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/insurance-eligibility">
              <OrangeButton>Check Eligibility</OrangeButton>
            </a>
            <a href="/no-cost-emi">
              <OutlineButton className="gap-2">
                <Wallet className="h-4 w-4 shrink-0 text-brand-orange" /> EMI options
              </OutlineButton>
            </a>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold text-muted-foreground">Policies we commonly help patients with include:</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {insurers.map((i) => (
              <div key={i} className="grid h-16 place-items-center rounded-xl border border-border bg-cream/70 px-2 text-center text-xs font-semibold text-navy">
                {i}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Insurer names are trademarks of their owners. Coverage depends on your individual policy.
          </p>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Patient stories ---------------- */

export interface HomeTestimonial {
  id: string;
  comment: string;
  patientName: string;
  city: string;
  treatment: string;
  rating?: number;
  doctorName?: string;
  doctorSlug?: string;
  createdAt?: string;
}

const storyDepartments = ["all", "proctology", "orthopaedics", "urology", "gynaecology", "ophthalmology", "ent"];

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("h-3.5 w-3.5", n <= Math.round(value) ? "fill-brand-orange text-brand-orange" : "text-border")} />
      ))}
    </span>
  );
}

export function Testimonials({
  testimonials: initial,
  summary,
}: {
  testimonials: HomeTestimonial[];
  summary?: { averageRating: number; totalReviews: number } | null;
}) {
  const [dept, setDept] = useState("all");
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dept === "all") {
      setItems(initial);
      return;
    }
    let live = true;
    setLoading(true);
    getReviewsFn({ data: { speciality: dept, minRating: 4, limit: 6 } })
      .then((res) => live && res.success && setItems(res.reviews))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [dept, initial]);

  if (!initial.length) return null;
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Patient stories</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl lg:text-[34px]">In Our Patients' Words</h2>
            {summary && summary.totalReviews > 0 ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Stars value={summary.averageRating} />
                <strong className="text-navy">{summary.averageRating}/5</strong> average from{" "}
                {summary.totalReviews.toLocaleString("en-IN")} patient reviews
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <a href="/reviews/write">
              <OrangeButton className="gap-2">
                <PenLine className="h-4 w-4" /> Write a Review
              </OrangeButton>
            </a>
            <a href="/reviews">
              <OutlineButton>View All</OutlineButton>
            </a>
          </div>
        </div>

        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
          {storyDepartments.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDept(d)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                dept === d ? "border-navy bg-navy text-white" : "border-border bg-background text-navy hover:border-navy/30",
              )}
            >
              {d === "all" ? "All departments" : SPECIALITIES.find((s) => s.slug === d)?.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No detailed reviews in this department yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <article key={t.id} className="flex flex-col justify-between rounded-xl border border-border/80 bg-background p-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <Quote className="h-6 w-6 text-brand-orange" />
                    {t.rating ? <Stars value={t.rating} /> : null}
                  </div>
                  <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-ink/80">"{t.comment}"</p>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {t.patientName.trim().slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 text-xs">
                    <p className="truncate text-sm font-semibold text-navy">{t.patientName}</p>
                    <p className="truncate text-muted-foreground">{[t.treatment, t.city].filter(Boolean).join(" • ")}</p>
                    {t.doctorName ? (
                      <p className="truncate text-muted-foreground">
                        Treated by{" "}
                        {t.doctorSlug ? (
                          <a href={`/doctors/${t.doctorSlug}`} className="font-semibold text-primary hover:underline">
                            {t.doctorName}
                          </a>
                        ) : (
                          t.doctorName
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
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
              Go Surgery helps patients in India get planned surgery with less confusion and less
              running around. We help you find an experienced surgeon, understand your treatment,
              deal with insurance and paperwork, and we stay in touch until you've recovered.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                ["One point of contact", "A care coordinator who knows your case — from the first call to your follow-up."],
                ["Clear information", "Plain-language guides to conditions and treatments, so you can ask better questions."],
                ["Honest about costs", "We explain what insurance covers and what you may pay, before you commit."],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <strong className="font-semibold text-navy">{title}:</strong> {text}
                  </div>
                </li>
              ))}
            </ul>
            <a href="/about" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              More about us <ArrowRight className="h-4 w-4" />
            </a>
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

export function Healthfeed() {
  if (!BLOG_POSTS.length) return null;
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead
          eyebrow="Health guides & articles"
          title="Read, Learn & Decide Better"
          subtitle="Plain-language guides on treatments, recovery and insurance."
          action={
            <a href="/blog">
              <OutlineButton>View All Articles</OutlineButton>
            </a>
          }
        />
        <Carousel>
          {BLOG_POSTS.slice(0, 8).map((p) => (
            <a
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex w-[260px] shrink-0 snap-start flex-col justify-between rounded-xl border border-border/80 bg-background p-5 shadow-sm transition-shadow hover:shadow-md sm:w-[300px]"
            >
              <div>
                <span className="w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">{p.category}</span>
                <h3 className="mt-4 text-base font-bold leading-snug text-navy group-hover:text-primary">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>
              </div>
              <p className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                {p.readMinutes} min read <ArrowRight className="h-4 w-4 text-brand-orange" />
              </p>
            </a>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

export const HOME_FAQS = [
  {
    q: "Is the first consultation really free?",
    a: "Yes. Your first consultation to discuss your condition and treatment options is free. Any tests or procedures the surgeon recommends are discussed with you — including costs — before anything is booked.",
  },
  {
    q: "Do I need to create an account to book?",
    a: "No. Just fill in the short form with your name, phone number, condition and city. You can optionally create an account later to track your request online.",
  },
  {
    q: "Will my insurance cover the surgery?",
    a: "Most medically necessary surgeries are covered by health insurance, subject to your policy's terms, waiting periods and sub-limits. Share your policy details and our team will check your eligibility for cashless treatment.",
  },
  {
    q: "How long does recovery take?",
    a: "It depends on the procedure. Many minimally invasive operations allow discharge within a day or two and a return to desk work within a week; bigger operations need longer. Each treatment page lists typical recovery times.",
  },
  {
    q: "Can I choose my surgeon and hospital?",
    a: "Yes. We'll suggest options based on your condition, location and insurance, but the choice is always yours.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container className="max-w-3xl">
        <SectionHead align="center" eyebrow="Good to know" title="Frequently Asked Questions" />
        <div className="space-y-3">
          {HOME_FAQS.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-xl border border-border/80 bg-cream/70">
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="text-sm font-semibold text-navy">{f.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-brand-orange transition-transform duration-200", open === i && "rotate-180")} />
              </button>
              {open === i ? <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p> : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Join the community ---------------- */

export function JoinCommunity() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await subscribeFn({ data: { email } }).catch(() => null);
    if (res?.success) setState("done");
    else {
      setState("idle");
      setError(res && !res.success ? res.error : "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="bg-navy py-12 sm:py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0 text-navy-foreground">
          <Eyebrow tone="light">Join the community</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl lg:text-[34px]">
            Health Guides, <span className="text-brand-orange">Straight to Your Inbox</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-navy-foreground/85 sm:text-base">
            Join the Go Surgery community for practical articles on conditions, surgery preparation
            and recovery. No spam — unsubscribe anytime.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-navy-foreground/85">
            {["New plain-language health guides", "Recovery tips from our care team", "Updates on insurance and EMI options"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-orange" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-background p-6 text-ink shadow-lg">
          {state === "done" ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-bold text-navy">You're in!</p>
              <p className="mt-1 text-sm text-muted-foreground">Thanks for joining. Look out for our next guide.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-base font-bold text-navy">Subscribe to our health newsletter</p>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
              <OrangeButton type="submit" disabled={state === "sending"} className="w-full">
                {state === "sending" ? "Joining..." : "Join the community"}
              </OrangeButton>
              <a
                href={whatsappHref("Hi, I'd like to join the Go Surgery community updates on WhatsApp.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md border border-emerald-600/30 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <MessageCircle className="h-4 w-4" /> Or message us on WhatsApp
              </a>
              <p className="text-center text-[11px] text-muted-foreground">
                By subscribing you agree to our <a href="/privacy" className="underline">privacy policy</a>.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
