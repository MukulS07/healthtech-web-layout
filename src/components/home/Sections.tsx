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
import { CALLER, cap, DEFAULT_WORDING, ENABLED_PROMISES, promiseEnabled, whatsappHref } from "@/lib/site";
import { roundDownPlus } from "@/lib/format";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import { subscribeFn } from "@/lib/server-functions/subscribers";
import type { SiteStats } from "@/lib/server-functions/site-stats";
import { cn } from "@/lib/utils";
import { A } from "@/components/common/A";
import { useSpecName, useT } from "@/lib/i18n/context";
import { Emph, WithLink } from "@/lib/i18n/rich";

/* ---------------- Find care ---------------- */

const tabs = ["specialities", "treatments", "conditions"] as const;
type Tab = (typeof tabs)[number];
const TAB_LABEL_KEY: Record<Tab, string> = {
  specialities: "nav.specialities",
  treatments: "nav.treatments",
  conditions: "nav.conditions",
};

const featuredTiles = [
  { slug: "proctology", titleKey: "home.tileProctology", img: tileProctology },
  { slug: "laparoscopy", titleKey: "home.tileLaparoscopy", img: tileLaparoscopy },
  { slug: "orthopaedics", titleKey: "home.tileOrtho", img: tileOrtho },
  { slug: "plastic-cosmetic-surgery", titleKey: "home.tileAesthetics", img: tileAesthetics },
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
  const t = useT();
  const specName = useSpecName();
  const [tab, setTab] = useState<Tab>("specialities");
  const [searchTerm, setSearchTerm] = useState("");
  const term = searchTerm.trim().toLowerCase();

  const matches = (text: string) => !term || text.toLowerCase().includes(term);
  const specLabel = (slug: string) => {
    const s = SPECIALITIES.find((x) => x.slug === slug);
    return s ? specName(s.slug, s.name) : "";
  };

  const items = useMemo(() => {
    if (tab === "specialities") {
      return SPECIALITIES.filter((s) => matches(`${s.name} ${specName(s.slug, s.name)} ${s.tagline}`)).map((s) => ({
        key: s.slug,
        href: `/specialities/${s.slug}`,
        title: specName(s.slug, s.name),
        sub: s.tagline,
      }));
    }
    if (tab === "treatments") {
      const list = term
        ? TREATMENTS.filter((t) => matches(`${t.name} ${(t.aka ?? []).join(" ")}`))
        : POPULAR_TREATMENTS.map((slug) => TREATMENTS.find((t) => t.slug === slug)!).filter(Boolean);
      return list.map((t) => ({
        key: t.slug,
        href: `/treatments/${t.slug}`,
        title: t.name,
        sub: specLabel(t.speciality),
      }));
    }
    return CONDITIONS.filter((c) => matches(`${c.name} ${(c.aka ?? []).join(" ")}`))
      .slice(0, term ? 60 : 16)
      .map((c) => ({
        key: c.slug,
        href: `/conditions/${c.slug}`,
        title: c.name,
        sub: specLabel(c.speciality),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, term]);

  const viewAll = {
    specialities: { href: "/specialities", label: t("home.viewAllSpecs", { n: SPECIALITIES.length }) },
    treatments: { href: "/treatments", label: t("home.viewAllTreatments", { n: TREATMENTS.length }) },
    conditions: { href: "/conditions", label: t("home.viewAllConditions", { n: CONDITIONS.length }) },
  }[tab];

  return (
    <section id="specialities" className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow={t("home.careEyebrow")}
          title={<Emph text={t("home.careTitle")} />}
          subtitle={t("home.careSub")}
        />
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-cream/80 p-2 shadow-sm sm:flex sm:items-center sm:gap-2">
          <div role="tablist" className="flex shrink-0 gap-1 rounded-xl bg-background/90 p-1">
            {tabs.map((id) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                  tab === id ? "bg-navy text-navy-foreground shadow-sm" : "text-muted-foreground hover:text-navy",
                )}
              >
                {t(TAB_LABEL_KEY[id])}
              </button>
            ))}
          </div>
          <label className="mt-2 flex flex-1 items-center gap-2 px-3 py-1.5 sm:mt-0">
            <Search className="h-4 w-4 shrink-0 text-brand-orange" />
            <span className="sr-only">{t("home.searchLabel", { what: t(TAB_LABEL_KEY[tab]).toLowerCase() })}</span>
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
              placeholder={t("home.searchPlaceholder", { what: t(TAB_LABEL_KEY[tab]).toLowerCase() })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        {tab === "specialities" && !term ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTiles.map((tile) => {
              const spec = SPECIALITIES.find((s) => s.slug === tile.slug)!;
              return (
                <A
                  href={`/specialities/${tile.slug}`}
                  key={tile.slug}
                  className="group relative overflow-hidden rounded-xl border border-border/80 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img
                    src={tile.img}
                    alt={t(tile.titleKey)}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 rounded-lg bg-background/95 p-3.5 shadow-lg backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <Eyebrow tone="orange">{specName(spec.slug, spec.name)}</Eyebrow>
                      <ArrowRight className="h-4 w-4 text-brand-orange transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1 text-sm font-bold text-navy">{t(tile.titleKey)}</p>
                  </div>
                </A>
              );
            })}
          </div>
        ) : null}

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <A
              key={it.key}
              href={it.href}
              // min-w-0: the label inside uses `truncate` (white-space: nowrap), whose min-content
              // width would otherwise stretch this grid column past the phone viewport.
              className="group flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-cream/60 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-cream"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy">{it.title}</span>
                {it.sub ? <span className="block truncate text-xs text-muted-foreground">{it.sub}</span> : null}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
            </A>
          ))}
          {items.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
              <WithLink
                text={t("home.noMatch", { term: searchTerm })}
                link={
                  <A href="/contact" className="font-semibold text-primary underline">
                    {t("home.askTeam")}
                  </A>
                }
              />
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex justify-center">
          <A href={viewAll.href}>
            <OutlineButton className="inline-flex items-center gap-2 text-sm font-semibold">
              {viewAll.label} <ArrowRight className="h-4 w-4 text-brand-orange" />
            </OutlineButton>
          </A>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Specialised centres ---------------- */

const centres = [
  { key: "women", icon: Baby, slugs: ["gynaecology", "ivf-fertility"] },
  { key: "bone", icon: Bone, slugs: ["orthopaedics", "spine-surgery"] },
  { key: "digestive", icon: HeartPulse, slugs: ["proctology", "laparoscopy", "gastrointestinal-surgery", "bariatric-surgery"] },
  { key: "kidney", icon: ClipboardList, slugs: ["urology"] },
  { key: "eye", icon: Eye, slugs: ["ophthalmology"] },
  { key: "aesthetics", icon: Sparkles, slugs: ["plastic-cosmetic-surgery", "hair-transplant"] },
];
const centreKey = (k: string) => `home.centre${k.charAt(0).toUpperCase()}${k.slice(1)}`;

export function SpecialisedCentres() {
  const t = useT();
  const specName = useSpecName();
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow={t("home.centresEyebrow")}
          title={t("home.centresTitle")}
          subtitle={t("home.centresSub")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centres.map((c) => (
            <article key={c.key} className="flex flex-col rounded-xl border border-border/80 bg-background p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-orange-soft text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{t(centreKey(c.key))}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`${centreKey(c.key)}Desc`)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.slugs.map((slug) => {
                  const s = SPECIALITIES.find((x) => x.slug === slug);
                  return s ? (
                    <A
                      key={slug}
                      href={`/specialities/${slug}`}
                      className="rounded-full border border-border bg-cream px-3 py-1 text-xs font-semibold text-navy hover:border-primary/40"
                    >
                      {specName(s.slug, s.name)}
                    </A>
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
  { id: "pre", tagKey: "home.expPre", img: expPre, points: ["home.expPre1", "home.expPre2", "home.expPre3", "home.expPre4"] },
  { id: "day", tagKey: "home.expDay", img: expDuring, points: ["home.expDay1", "home.expDay2", "home.expDay3", "home.expDay4"] },
  { id: "rec", tagKey: "home.expRec", img: expRecovery, points: ["home.expRec1", "home.expRec2", "home.expRec3", "home.expRec4"] },
];

export function PatientExperiences() {
  const t = useT();
  // The first point names who listens, which follows the CALLER flag; the translation describes the
  // default ("our team"), so once a flag changes the English wording built from it is shown instead.
  const point = (key: string) =>
    key === "home.expPre1" && !DEFAULT_WORDING ? `${cap(CALLER)} listens to your symptoms and questions` : t(key);
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          align="center"
          eyebrow={t("home.expEyebrow")}
          title={t("home.expTitle")}
          subtitle={t("home.expSub")}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {experiences.map((exp) => (
            <article key={exp.id} className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm">
              <div className="relative">
                <img src={exp.img} alt={t(exp.tagKey)} loading="lazy" width={800} height={900} className="h-52 w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-navy-foreground shadow-sm">
                  {t(exp.tagKey)}
                </span>
              </div>
              <ul className="flex-1 space-y-2.5 p-5">
                {exp.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point(p)}</span>
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
  const t = useT();
  if (!hospitals.length) return null;
  return (
    <section className="bg-navy py-12 text-navy-foreground sm:py-16">
      <Container>
        <SectionHead
          tone="light"
          eyebrow={t("home.hospEyebrow")}
          title={t("home.hospTitle")}
          subtitle={t("home.hospSub")}
          action={
            <A href="/hospitals">
              <OutlineButton tone="light">{t("home.hospAll")}</OutlineButton>
            </A>
          }
        />
        <Carousel>
          {hospitals.map((h, i) => (
            <article
              key={h.id || i}
              className="flex w-[280px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl bg-background text-ink shadow-md sm:w-[320px]"
            >
              <A href={h.slug ? `/hospitals/${h.slug}` : "/hospitals"} className="block">
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
              </A>
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <A href={h.slug ? `/hospitals/${h.slug}` : "/hospitals"} className="flex-1">
                    <OutlineButton className="w-full justify-center px-3 py-2 text-xs">{t("action.viewDetails")}</OutlineButton>
                  </A>
                  <A href={`/contact?city=${encodeURIComponent(h.city)}`} className="flex-1">
                    <OrangeButton className="w-full justify-center px-3 py-2 text-xs">{t("home.requestConsult")}</OrangeButton>
                  </A>
                </div>
              </div>
            </article>
          ))}
        </Carousel>
        <p className="mt-6 text-[11px] text-navy-foreground/60">
          {t("home.hospDisclaimer")}
        </p>
      </Container>
    </section>
  );
}

/* ---------------- Journey ---------------- */

const journey = [
  { icon: Phone, n: 1 },
  { icon: Stethoscope, n: 2 },
  { icon: ClipboardList, n: 3 },
  { icon: Wallet, n: 4 },
  { icon: HeartHandshake, n: 5 },
];

export function Journey() {
  const t = useT();
  const desc = (n: number) =>
    n === 1 && !DEFAULT_WORDING
      ? `Fill in the form or call us. ${cap(CALLER)} calls you back to understand your symptoms.`
      : t(`home.step${n}Desc`);
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead align="center" eyebrow={t("home.howEyebrow")} title={t("home.howTitle")} subtitle={t("home.howSub")} />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {journey.map((step, i) => (
            <li key={step.n} className="relative rounded-xl border border-border/80 bg-background p-5 shadow-sm">
              <span className="absolute right-4 top-4 text-3xl font-extrabold text-navy/10">{i + 1}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-navy-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{t(`home.step${step.n}Title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc(step.n)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ---------------- Doctors ---------------- */

export function Doctors({ doctors }: { doctors: DoctorCardData[] }) {
  const t = useT();
  if (!doctors.length) return null;
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container>
        <SectionHead
          eyebrow={t("home.docEyebrow")}
          title={<Emph text={t("home.docTitle")} className="text-brand-orange" />}
          subtitle={t("home.docSub")}
          action={
            <A href="/doctors">
              <OutlineButton>{t("home.docAll")}</OutlineButton>
            </A>
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
  const t = useT();
  if (!stats || stats.surgeons === 0) return null;
  const items = [
    { value: roundDownPlus(stats.surgeons), label: t("home.statDirectory") },
    { value: roundDownPlus(stats.hospitals), label: t("hero.statHospitals") },
    { value: String(stats.cities), label: t("hero.statCities") },
    ...(stats.reviews > 0 ? [{ value: roundDownPlus(stats.reviews), label: t("home.statReviews") }] : []),
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
  const t = useT();
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <Eyebrow>{t("home.insEyebrow")}</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-navy sm:text-3xl lg:text-[34px]">
            <Emph text={t("home.insTitle")} />
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("home.insBody")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <A href="/insurance-eligibility">
              <OrangeButton>{t("home.insCheck")}</OrangeButton>
            </A>
            <A href="/no-cost-emi">
              <OutlineButton className="gap-2">
                <Wallet className="h-4 w-4 shrink-0 text-brand-orange" /> {t("home.insEmi")}
              </OutlineButton>
            </A>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold text-muted-foreground">{t("home.insCommon")}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {insurers.map((i) => (
              <div key={i} className="grid h-16 place-items-center rounded-xl border border-border bg-cream/70 px-2 text-center text-xs font-semibold text-navy">
                {i}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t("home.insDisclaimer")}
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
  const t = useT();
  return (
    <span className="inline-flex" aria-label={t("home.starsAria", { value })}>
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
  const t = useT();
  const specName = useSpecName();
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
            <Eyebrow>{t("home.storiesEyebrow")}</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl lg:text-[34px]">{t("home.storiesTitle")}</h2>
            {summary && summary.totalReviews > 0 ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Stars value={summary.averageRating} />
                {/* roundDownPlus, not the exact count: the hero states the same figure as
                    "2,40,000+" and printing "2,47,591" here made one page claim two different
                    review totals. */}
                <span>
                  <Emph
                    text={t("home.storiesAvg", { rating: summary.averageRating, count: roundDownPlus(summary.totalReviews) })}
                    className="font-bold text-navy"
                  />
                </span>
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <A href="/reviews/write">
              <OrangeButton className="gap-2">
                <PenLine className="h-4 w-4" /> {t("action.writeReview")}
              </OrangeButton>
            </A>
            <A href="/reviews">
              <OutlineButton>{t("home.viewAll")}</OutlineButton>
            </A>
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
              {d === "all" ? t("home.allDepts") : specName(d, SPECIALITIES.find((s) => s.slug === d)?.name ?? d)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("home.noDetailed")}</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* min-w-0 + break-words on the cards below: grid items default to min-width:auto, so a
                review containing one long unbroken token stretched the card past the viewport and
                gave the whole homepage a horizontal scrollbar on phones. */}
            {items.map((r) => (
              <article key={r.id} className="flex min-w-0 flex-col justify-between rounded-xl border border-border/80 bg-background p-6 shadow-sm">
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <Quote className="h-6 w-6 text-brand-orange" />
                    {r.rating ? <Stars value={r.rating} /> : null}
                  </div>
                  <p className="mt-4 line-clamp-5 break-words text-sm leading-relaxed text-ink/80">"{r.comment}"</p>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {r.patientName.trim().slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 text-xs">
                    <p className="truncate text-sm font-semibold text-navy">{r.patientName}</p>
                    <p className="truncate text-muted-foreground">{[r.treatment, r.city].filter(Boolean).join(" • ")}</p>
                    {r.doctorName ? (
                      <p className="truncate text-muted-foreground">
                        <WithLink
                          text={t("home.treatedBy")}
                          link={
                            r.doctorSlug ? (
                              <A href={`/doctors/${r.doctorSlug}`} className="font-semibold text-primary hover:underline">
                                {r.doctorName}
                              </A>
                            ) : (
                              r.doctorName
                            )
                          }
                        />
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
  const t = useT();
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="min-w-0">
          <Eyebrow>{t("home.aboutEyebrow")}</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{t("home.aboutTitle")}</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("home.aboutBody")}</p>
            <ul className="space-y-3 pt-2">
              {[1, 2, 3].map((n) => (
                <li key={n} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <strong className="font-semibold text-navy">{t(`home.aboutPoint${n}`)}:</strong> {t(`home.aboutPoint${n}Text`)}
                  </div>
                </li>
              ))}
            </ul>
            <A href="/about" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {t("home.aboutMore")} <ArrowRight className="h-4 w-4" />
            </A>
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
  const t = useT();
  if (!BLOG_POSTS.length) return null;
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <SectionHead
          eyebrow={t("home.feedEyebrow")}
          title={t("home.feedTitle")}
          subtitle={t("home.feedSub")}
          action={
            <A href="/blog">
              <OutlineButton>{t("home.feedAll")}</OutlineButton>
            </A>
          }
        />
        <Carousel>
          {BLOG_POSTS.slice(0, 8).map((p) => (
            <A
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
                {t("home.readMin", { n: p.readMinutes })} <ArrowRight className="h-4 w-4 text-brand-orange" />
              </p>
            </A>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const ALL_HOME_FAQS: { q: string; a: string; requires?: "free-consult" }[] = [
  {
    requires: "free-consult",
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

// A FAQ that promises a free first consultation must not show (on the page or in the structured data
// search engines read) unless that promise is switched on in src/lib/site.ts.
export const HOME_FAQS = ALL_HOME_FAQS.filter((f) => !f.requires || promiseEnabled(f.requires));

export function Faq() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container className="max-w-3xl">
        <SectionHead align="center" eyebrow={t("home.faqEyebrow")} title={t("home.faqTitle")} />
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
  const t = useT();
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
      setError(res && !res.success ? res.error : t("home.genericError"));
    }
  };

  return (
    <section className="bg-navy py-12 sm:py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0 text-navy-foreground">
          <Eyebrow tone="light">{t("home.joinEyebrow")}</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl lg:text-[34px]">
            <Emph text={t("home.joinTitle")} className="text-brand-orange" />
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-navy-foreground/85 sm:text-base">
            {t("home.joinBody")}
          </p>
          <ul className="mt-5 space-y-2 text-sm text-navy-foreground/85">
            {["home.joinPoint1", "home.joinPoint2", "home.joinPoint3"].map((k) => (
              <li key={k} className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-orange" /> {t(k)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-background p-6 text-ink shadow-lg">
          {state === "done" ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-bold text-navy">{t("home.joinDone")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.joinDoneSub")}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-base font-bold text-navy">{t("home.joinFormTitle")}</p>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={t("home.joinEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
              <OrangeButton type="submit" disabled={state === "sending"} className="w-full">
                {state === "sending" ? t("home.joining") : t("home.joinEyebrow")}
              </OrangeButton>
              <A
                href={whatsappHref("Hi, I'd like to join the Go Surgery community updates on WhatsApp.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md border border-emerald-600/30 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <MessageCircle className="h-4 w-4" /> {t("home.joinWhatsapp")}
              </A>
              <p className="text-center text-[11px] text-muted-foreground">
                <WithLink
                  text={t("home.joinConsent")}
                  link={
                    <A href="/privacy" className="underline">
                      {t("form.consentLink")}
                    </A>
                  }
                />
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
