import { ArrowRight, MapPin, PenLine, Star } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { DoctorCard, type DoctorCardData } from "@/components/doctors/DoctorCard";
import {
  BenefitsStrip,
  Breadcrumbs,
  FaqList,
  InsuranceEmiBlock,
  MedicalDisclaimer,
  ReadMore,
  Section,
  WhyChooseUs,
} from "@/components/care/Blocks";
import {
  BOOKING_FAQS,
  conditionsForSpeciality,
  treatmentsForSpeciality,
  type Speciality,
} from "@/data/catalog";
import { CITIES } from "@/lib/site";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { getHospitalsFn } from "@/lib/server-functions/hospitals";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";
import hospital1 from "@/assets/hospital-1.jpg";

export type CitySlug = (typeof CITIES)[number]["slug"];

export function cityBySlug(slug?: string) {
  return CITIES.find((c) => c.slug === slug);
}

/** Server data for a speciality page (optionally narrowed to one city). */
export async function loadSpecialityData(spec: Speciality, cityName?: string) {
  const [doctors, hospitals, reviews] = await Promise.all([
    getDoctorsFn({ data: { specialty: spec.slug, city: cityName, limit: 6, sort: "Rating: High to Low" } }).catch(() => null),
    getHospitalsFn({ data: { speciality: spec.slug, city: cityName, limit: 6 } }).catch(() => null),
    getReviewsFn({ data: { speciality: spec.slug, limit: 6 } }).catch(() => null),
  ]);
  return {
    doctors: doctors?.success ? doctors.doctors : [],
    doctorTotal: doctors?.success ? doctors.total : 0,
    hospitals: hospitals?.success ? hospitals.hospitals : [],
    hospitalTotal: hospitals?.success ? hospitals.total : 0,
    reviews: reviews?.success ? reviews.reviews : [],
    reviewSummary: reviews?.success ? { average: reviews.averageRating, count: reviews.totalReviews } : { average: 0, count: 0 },
  };
}

export type SpecialityData = Awaited<ReturnType<typeof loadSpecialityData>>;

export function specialityHead(
  spec: Speciality,
  city: { name: string; slug: string } | undefined,
  data: SpecialityData | undefined,
) {
  const cityName = city?.name;
  const where = cityName ? ` in ${cityName}` : "";
  const path = `/specialities/${spec.slug}${city ? `/${city.slug}` : ""}`;
  const faqs = [...spec.faqs, ...BOOKING_FAQS];
  return seo({
    title: cityName ? `Best ${spec.name} Doctors & Treatment${where}` : `${spec.name} — Conditions, Treatments & Specialists`,
    description: cityName
      ? `Find ${spec.name.toLowerCase()} surgeons${where}${data?.doctorTotal ? ` (${data.doctorTotal} listed)` : ""}, compare hospitals and read patient reviews. Book a free consultation with Go Surgery.`
      : `${spec.tagline} Learn about conditions and treatments, find specialists near you and book a free consultation.`,
    path,
    // A city page with no doctors and no hospitals would be a thin doorway page — keep it out of the index.
    noindex: Boolean(cityName && data && data.doctorTotal === 0 && data.hospitalTotal === 0),
    jsonLd: [
      {
        "@type": "MedicalWebPage",
        name: `${spec.name}${where}`,
        description: spec.intro,
        specialty: spec.name,
        audience: { "@type": "Patient" },
      },
      faqLd(faqs),
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Specialities", path: "/specialities" },
        { name: spec.name, path: `/specialities/${spec.slug}` },
        ...(cityName ? [{ name: cityName, path }] : []),
      ]),
    ],
  });
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={n <= Math.round(value) ? "h-4 w-4 fill-brand-orange text-brand-orange" : "h-4 w-4 text-border"} />
      ))}
    </span>
  );
}

export function SpecialityPage({
  spec,
  citySlug,
  data,
}: {
  spec: Speciality;
  citySlug?: string | undefined;
  data: SpecialityData;
}) {
  const city = cityBySlug(citySlug);
  const where = city ? ` in ${city.name}` : "";
  const conditions = conditionsForSpeciality(spec.slug);
  const treatments = treatmentsForSpeciality(spec.slug);
  const faqs = [...spec.faqs, ...BOOKING_FAQS];
  const doctorsHref = `/doctors?specialty=${spec.slug}${city ? `&city=${encodeURIComponent(city.name)}` : ""}`;
  const hospitalsHref = `/hospitals?speciality=${spec.slug}${city ? `&city=${encodeURIComponent(city.name)}` : ""}`;

  const toc = [
    ["about", "About"],
    ["conditions", "Conditions"],
    ["treatments", "Treatments"],
    ["doctors", "Doctors"],
    ["hospitals", "Hospitals"],
    ["reviews", "Reviews"],
    ["faqs", "FAQs"],
  ] as const;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Specialities", href: "/specialities" },
            city ? { name: spec.name, href: `/specialities/${spec.slug}` } : { name: spec.name },
            ...(city ? [{ name: city.name }] : []),
          ]}
        />

        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Speciality</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              {spec.name}
              {where}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/80 sm:text-base">{spec.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book"><OrangeButton>Book Free Consultation</OrangeButton></a>
              <a href="#doctors"><OutlineButton tone="light">Find a {spec.name} doctor</OutlineButton></a>
            </div>
            {data.reviewSummary.count > 0 || data.doctorTotal > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                {data.doctorTotal > 0 ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-navy-foreground">
                    {data.doctorTotal.toLocaleString("en-IN")} {spec.name.toLowerCase()} doctors listed{where}
                  </span>
                ) : null}
                {data.reviewSummary.count > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-navy-foreground">
                    <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {data.reviewSummary.average}/5 from{" "}
                    {data.reviewSummary.count.toLocaleString("en-IN")} patient reviews
                  </span>
                ) : null}
              </div>
            ) : null}
          </Container>
        </section>

        <nav aria-label="On this page" className="sticky top-[73px] z-30 border-b border-border bg-background/95 backdrop-blur">
          <Container className="no-scrollbar flex gap-5 overflow-x-auto py-2.5 text-sm font-semibold">
            {toc.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 text-muted-foreground hover:text-navy">{label}</a>
            ))}
          </Container>
        </nav>

        <section className="py-10">
          <Container className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="min-w-0 space-y-12">
              <Section id="about" eyebrow="Overview" title={`What is ${spec.name}?`}>
                <ReadMore intro={spec.intro} more={spec.more} />
              </Section>

              {conditions.length ? (
                <Section id="conditions" eyebrow="What we treat" title={`Conditions treated in ${spec.name}`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {conditions.map((c) => (
                      <a key={c.slug} href={`/conditions/${c.slug}`} className="group rounded-lg border border-border bg-cream p-4 transition-shadow hover:shadow-md">
                        <h3 className="flex items-center justify-between text-sm font-bold text-navy">
                          {c.name} <ArrowRight className="h-4 w-4 text-brand-orange opacity-60 group-hover:opacity-100" />
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.summary}</p>
                      </a>
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section id="treatments" eyebrow="Procedures" title={`${spec.name} treatments`}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {treatments.map((t) => (
                    <a key={t.slug} href={`/treatments/${t.slug}`} className="group rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md">
                      <h3 className="flex items-center justify-between text-sm font-bold text-navy">
                        {t.name} <ArrowRight className="h-4 w-4 text-brand-orange opacity-60 group-hover:opacity-100" />
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.summary}</p>
                      <p className="mt-2 text-[11px] font-semibold text-primary">Stay: {t.stay}</p>
                    </a>
                  ))}
                </div>
              </Section>

              <Section eyebrow="Why Go Surgery" title="Why patients choose us">
                <WhyChooseUs specialityName={spec.name} />
                <div className="mt-4">
                  <BenefitsStrip />
                </div>
              </Section>

              <Section
                id="doctors"
                eyebrow="Specialists"
                title={`${spec.name} doctors${where}`}
                action={
                  <a href={doctorsHref}>
                    <OutlineButton className="px-3 py-2 text-xs">View all{data.doctorTotal ? ` ${data.doctorTotal.toLocaleString("en-IN")}` : ""} doctors</OutlineButton>
                  </a>
                }
              >
                <CityPicker specSlug={spec.slug} active={city?.slug} />
                {data.doctors.length ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {data.doctors.map((d: DoctorCardData) => (
                      <DoctorCard key={d.id} doctor={d} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-border bg-cream p-6 text-center">
                    <p className="font-semibold text-navy">We don't have {spec.name.toLowerCase()} doctors listed{where} yet.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Talk to a care specialist — we'll help you find the right surgeon nearby.</p>
                    <a href="#book" className="mt-3 inline-block"><OrangeButton className="px-4 py-2 text-sm">Talk to a care specialist</OrangeButton></a>
                  </div>
                )}
              </Section>

              <Section
                id="hospitals"
                eyebrow="Hospitals"
                title={`Hospitals for ${spec.name}${where}`}
                action={data.hospitals.length ? <a href={hospitalsHref}><OutlineButton className="px-3 py-2 text-xs">View all hospitals</OutlineButton></a> : undefined}
              >
                {data.hospitals.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.hospitals.map((h) => (
                      <a key={h.id} href={`/hospitals/${h.slug}`} className="flex gap-3 rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-md">
                        <img src={h.img || hospital1} alt={h.name} loading="lazy" className="h-16 w-20 shrink-0 rounded-md object-cover" />
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-sm font-bold text-navy">{h.name}</h3>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" /> <span className="line-clamp-1">{[h.locality, h.city].filter(Boolean).join(", ")}</span>
                          </p>
                          {h.rating ? (
                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-navy">
                              <Star className="h-3 w-3 fill-brand-orange text-brand-orange" /> {h.rating} ({h.reviewCount})
                            </p>
                          ) : null}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ask our care team about hospitals for {spec.name.toLowerCase()}{where} — we'll suggest options that suit your treatment and insurance.
                  </p>
                )}
              </Section>

              <Section
                id="reviews"
                eyebrow="Patient reviews"
                title={`What ${spec.name.toLowerCase()} patients say`}
                action={
                  <div className="flex gap-2">
                    <a href={`/reviews/write`}><OrangeButton className="gap-1.5 px-3 py-2 text-xs"><PenLine className="h-3.5 w-3.5" /> Write a Review</OrangeButton></a>
                    <a href="/reviews"><OutlineButton className="px-3 py-2 text-xs">View all</OutlineButton></a>
                  </div>
                }
              >
                {data.reviewSummary.count > 0 ? (
                  <div className="mb-4 flex items-center gap-3 rounded-lg bg-cream p-4">
                    <p className="text-3xl font-extrabold text-navy">{data.reviewSummary.average}</p>
                    <div>
                      <Stars value={data.reviewSummary.average} />
                      <p className="text-xs text-muted-foreground">
                        Based on {data.reviewSummary.count.toLocaleString("en-IN")} reviews of {spec.name.toLowerCase()} doctors in our directory
                      </p>
                    </div>
                  </div>
                ) : null}
                {data.reviews.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.reviews.map((r) => (
                      <article key={r.id} className="rounded-xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-navy">{r.patientName}</p>
                          <Stars value={r.rating} />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {[r.city, new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })].filter(Boolean).join(" • ")}
                        </p>
                        <p className="mt-2 line-clamp-4 text-sm text-ink/80">{r.comment}</p>
                        {r.doctorName ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Treated by{" "}
                            {r.doctorSlug ? <a href={`/doctors/${r.doctorSlug}`} className="font-semibold text-primary hover:underline">{r.doctorName}</a> : r.doctorName}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No detailed reviews yet for this speciality.</p>
                )}
              </Section>

              <Section eyebrow="Paying for treatment" title="Insurance & EMI">
                <InsuranceEmiBlock />
              </Section>

              <Section id="faqs" eyebrow="FAQs" title={`${spec.name} — frequently asked questions`}>
                <FaqList faqs={faqs} />
              </Section>

              <Section eyebrow="Near you" title={`${spec.name} treatment in top cities`}>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <a
                      key={c.slug}
                      href={`/specialities/${spec.slug}/${c.slug}`}
                      className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary/40"
                    >
                      {spec.name} in {c.name}
                    </a>
                  ))}
                </div>
              </Section>

              <MedicalDisclaimer />
            </div>

            <aside id="book" className="scroll-mt-40 lg:sticky lg:top-36 lg:self-start">
              <ConsultForm defaultInterest={`s:${spec.slug}`} defaultCity={city?.name} />
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CityPicker({ specSlug, active }: { specSlug: string; active?: string | undefined }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      <a
        href={`/specialities/${specSlug}#doctors`}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${!active ? "border-navy bg-navy text-white" : "border-border bg-background text-navy"}`}
      >
        All cities
      </a>
      {CITIES.map((c) => (
        <a
          key={c.slug}
          href={`/specialities/${specSlug}/${c.slug}#doctors`}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${active === c.slug ? "border-navy bg-navy text-white" : "border-border bg-background text-navy hover:border-navy/30"}`}
        >
          {c.name}
        </a>
      ))}
    </div>
  );
}
