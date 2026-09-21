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
  ContentReviewNote,
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
import { BOOK_LABEL, CITIES, TOP_CITIES, CONSULT_PHRASE, promiseEnabled } from "@/lib/site";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { getHospitalsFn } from "@/lib/server-functions/hospitals";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import { getPageFaqsFn } from "@/lib/server-functions/faqs";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/locales";
import hospital1 from "@/assets/hospital-1.jpg";
import { A } from "@/components/common/A";
import { useLocale, useSpecName, useT } from "@/lib/i18n/context";
import { WithLink } from "@/lib/i18n/rich";

export type CitySlug = (typeof CITIES)[number]["slug"];

export function cityBySlug(slug?: string) {
  return CITIES.find((c) => c.slug === slug);
}

/** Server data for a speciality page (optionally narrowed to one city). */
export async function loadSpecialityData(spec: Speciality, cityName?: string) {
  const [doctors, hospitals, reviews, extraFaqs] = await Promise.all([
    getDoctorsFn({ data: { specialty: spec.slug, city: cityName, limit: 6, sort: "Rating: High to Low" } }).catch(() => null),
    getHospitalsFn({ data: { speciality: spec.slug, city: cityName, limit: 6 } }).catch(() => null),
    getReviewsFn({ data: { speciality: spec.slug, limit: 6 } }).catch(() => null),
    // FAQs the care team added in the admin panel for this speciality, on top of the
    // hand-written ones in the catalog. Failure here must not take the page down.
    getPageFaqsFn({ data: { pageType: "speciality", pageSlug: spec.slug } }).catch(() => null),
  ]);
  return {
    extraFaqs: extraFaqs?.success ? extraFaqs.faqs : [],
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
  locale: Locale,
) {
  const cityName = city?.name;
  const where = cityName ? ` in ${cityName}` : "";
  const path = `/specialities/${spec.slug}${city ? `/${city.slug}` : ""}`;
  const faqs = [...spec.faqs, ...(data?.extraFaqs ?? []), ...BOOKING_FAQS];
  return seo({ locale,
    title: cityName ? `Best ${spec.name} Doctors & Treatment${where}` : `${spec.name} — Conditions, Treatments & Specialists`,
    description: cityName
      ? `Find ${spec.name.toLowerCase()} surgeons${where}${data?.doctorTotal ? ` (${data.doctorTotal} listed)` : ""}, compare hospitals and read patient reviews. Book ${CONSULT_PHRASE} with Go Surgery.`
      : `${spec.tagline} Learn about conditions and treatments, find specialists near you and book ${CONSULT_PHRASE}.`,
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
  const t = useT();
  return (
    <span className="inline-flex" aria-label={t("home.starsAria", { value })}>
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
  const t = useT();
  const locale = useLocale();
  const specLabel = useSpecName();
  const city = cityBySlug(citySlug);
  const name = specLabel(spec.slug, spec.name);
  // English keeps its lower-cased running text ("proctology doctors"); other scripts have no case.
  const lc = (s: string) => (locale === "en" ? s.toLowerCase() : s);
  const inCity = (title: string) => (city ? t("dir.titleInCity", { title, city: city.name }) : title);
  const conditions = conditionsForSpeciality(spec.slug);
  const treatments = treatmentsForSpeciality(spec.slug);
  const faqs = [...spec.faqs, ...(data?.extraFaqs ?? []), ...BOOKING_FAQS];
  const doctorsHref = `/doctors?specialty=${spec.slug}${city ? `&city=${encodeURIComponent(city.name)}` : ""}`;
  const hospitalsHref = `/hospitals?speciality=${spec.slug}${city ? `&city=${encodeURIComponent(city.name)}` : ""}`;

  const toc = [
    ["about", t("sp.tocAbout")],
    ["conditions", t("nav.conditions")],
    ["treatments", t("nav.treatments")],
    ["doctors", t("nav.doctors")],
    ["hospitals", t("nav.hospitals")],
    ["reviews", t("sp.tocReviews")],
    ["faqs", t("nav.faqs")],
  ] as const;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs
          items={[
            { name: t("common.home"), href: "/" },
            { name: t("nav.specialities"), href: "/specialities" },
            city ? { name, href: `/specialities/${spec.slug}` } : { name },
            ...(city ? [{ name: city.name }] : []),
          ]}
        />

        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{t("dir.speciality")}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              {inCity(name)}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/80 sm:text-base">{spec.tagline}</p>
            <ContentReviewNote reviewedBy={spec.reviewedBy} />
            <div className="mt-6 flex flex-wrap gap-3">
              <A href="#book"><OrangeButton>{promiseEnabled("free-consult") ? BOOK_LABEL : t("action.book")}</OrangeButton></A>
              <A href="#doctors"><OutlineButton tone="light">{t("sp.findDoctor", { spec: name })}</OutlineButton></A>
            </div>
            {data.reviewSummary.count > 0 || data.doctorTotal > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                {data.doctorTotal > 0 ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-navy-foreground">
                    {city
                      ? t("sp.doctorsListedIn", { n: data.doctorTotal.toLocaleString("en-IN"), spec: lc(name), city: city.name })
                      : t("sp.doctorsListed", { n: data.doctorTotal.toLocaleString("en-IN"), spec: lc(name) })}
                  </span>
                ) : null}
                {data.reviewSummary.count > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-navy-foreground">
                    <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />{" "}
                    {t("sp.ratingChip", { rating: data.reviewSummary.average, n: data.reviewSummary.count.toLocaleString("en-IN") })}
                  </span>
                ) : null}
              </div>
            ) : null}
          </Container>
        </section>

        <nav aria-label={t("sp.onThisPage")} className="sticky top-[73px] z-30 border-b border-border bg-background/95 backdrop-blur">
          <Container className="no-scrollbar flex gap-5 overflow-x-auto py-2.5 text-sm font-semibold">
            {toc.map(([id, label]) => (
              <A key={id} href={`#${id}`} className="shrink-0 text-muted-foreground hover:text-navy">{label}</A>
            ))}
          </Container>
        </nav>

        <section className="py-10">
          <Container className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="min-w-0 space-y-12">
              <Section id="about" eyebrow={t("sp.overview")} title={t("sp.whatIs", { spec: name })}>
                <ReadMore intro={spec.intro} more={spec.more} />
              </Section>

              {conditions.length ? (
                <Section id="conditions" eyebrow={t("sp.whatWeTreat")} title={t("sp.conditionsIn", { spec: name })}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {conditions.map((c) => (
                      <A key={c.slug} href={`/conditions/${c.slug}`} className="group rounded-lg border border-border bg-cream p-4 transition-shadow hover:shadow-md">
                        <h3 className="flex items-center justify-between text-sm font-bold text-navy">
                          {c.name} <ArrowRight className="h-4 w-4 text-brand-orange opacity-60 group-hover:opacity-100" />
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.summary}</p>
                      </A>
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section id="treatments" eyebrow={t("prof.eyebrowProcedures")} title={t("sp.treatmentsOf", { spec: name })}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {treatments.map((tr) => (
                    <A key={tr.slug} href={`/treatments/${tr.slug}`} className="group rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md">
                      <h3 className="flex items-center justify-between text-sm font-bold text-navy">
                        {tr.name} <ArrowRight className="h-4 w-4 text-brand-orange opacity-60 group-hover:opacity-100" />
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tr.summary}</p>
                      <p className="mt-2 text-[11px] font-semibold text-primary">{t("sp.stay", { stay: tr.stay })}</p>
                    </A>
                  ))}
                </div>
              </Section>

              <Section eyebrow={t("sp.whyEyebrow")} title={t("sp.whyTitle")}>
                <WhyChooseUs specialityName={spec.name} />
                <div className="mt-4">
                  <BenefitsStrip />
                </div>
              </Section>

              <Section
                id="doctors"
                eyebrow={t("sp.specialists")}
                title={inCity(t("sp.doctorsTitle", { spec: name }))}
                action={
                  <A href={doctorsHref}>
                    <OutlineButton className="px-3 py-2 text-xs">{data.doctorTotal ? t("sp.viewAllDoctorsN", { n: data.doctorTotal.toLocaleString("en-IN") }) : t("sp.viewAllDoctors")}</OutlineButton>
                  </A>
                }
              >
                <p className="-mt-2 mb-3 text-xs text-muted-foreground">
                  {t("sp.matchedNote")}
                </p>
                <CityPicker specSlug={spec.slug} active={city?.slug} />
                {data.doctors.length ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {data.doctors.map((d: DoctorCardData) => (
                      <DoctorCard key={d.id} doctor={d} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-border bg-cream p-6 text-center">
                    <p className="font-semibold text-navy">
                      {city ? t("sp.noDoctorsIn", { spec: lc(name), city: city.name }) : t("sp.noDoctors", { spec: lc(name) })}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("sp.noDoctorsSub")}</p>
                    <A href="#book" className="mt-3 inline-block"><OrangeButton className="px-4 py-2 text-sm">{t("dir.talkSpecialist")}</OrangeButton></A>
                  </div>
                )}
              </Section>

              <Section
                id="hospitals"
                eyebrow={t("nav.hospitals")}
                title={inCity(t("sp.hospitalsFor", { spec: name }))}
                action={data.hospitals.length ? <A href={hospitalsHref}><OutlineButton className="px-3 py-2 text-xs">{t("sp.viewAllHospitals")}</OutlineButton></A> : undefined}
              >
                {data.hospitals.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.hospitals.map((h) => (
                      <A key={h.id} href={`/hospitals/${h.slug}`} className="flex gap-3 rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-md">
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
                      </A>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {city ? t("sp.hospAskIn", { spec: lc(name), city: city.name }) : t("sp.hospAsk", { spec: lc(name) })}
                  </p>
                )}
              </Section>

              <Section
                id="reviews"
                eyebrow={t("nav.reviews")}
                title={t("sp.whatPatientsSay", { spec: lc(name) })}
                action={
                  <div className="flex gap-2">
                    <A href={`/reviews/write`}><OrangeButton className="gap-1.5 px-3 py-2 text-xs"><PenLine className="h-3.5 w-3.5" /> {t("action.writeReview")}</OrangeButton></A>
                    <A href="/reviews"><OutlineButton className="px-3 py-2 text-xs">{t("home.viewAll")}</OutlineButton></A>
                  </div>
                }
              >
                {data.reviewSummary.count > 0 ? (
                  <div className="mb-4 flex items-center gap-3 rounded-lg bg-cream p-4">
                    <p className="text-3xl font-extrabold text-navy">{data.reviewSummary.average}</p>
                    <div>
                      <Stars value={data.reviewSummary.average} />
                      <p className="text-xs text-muted-foreground">
                        {t("sp.basedOn", { n: data.reviewSummary.count.toLocaleString("en-IN"), spec: lc(name) })}
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
                            <WithLink
                              text={t("home.treatedBy")}
                              link={r.doctorSlug ? <A href={`/doctors/${r.doctorSlug}`} className="font-semibold text-primary hover:underline">{r.doctorName}</A> : r.doctorName}
                            />
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("sp.noReviews")}</p>
                )}
              </Section>

              <Section eyebrow={t("sp.payEyebrow")} title={t("home.insEyebrow")}>
                <InsuranceEmiBlock />
              </Section>

              <Section id="faqs" eyebrow={t("nav.faqs")} title={t("sp.faqTitle", { spec: name })}>
                <FaqList faqs={faqs} />
              </Section>

              <Section eyebrow={t("sp.nearYou")} title={t("sp.topCities", { spec: name })}>
                <div className="flex flex-wrap gap-2">
                  {TOP_CITIES.map((c) => (
                    <A
                      key={c.slug}
                      href={`/specialities/${spec.slug}/${c.slug}`}
                      className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary/40"
                    >
                      {t("footer.specInCity", { spec: name, city: c.name })}
                    </A>
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
  const t = useT();
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      <A
        href={`/specialities/${specSlug}#doctors`}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${!active ? "border-navy bg-navy text-white" : "border-border bg-background text-navy"}`}
      >
        {t("city.allCities")}
      </A>
      {TOP_CITIES.map((c) => (
        <A
          key={c.slug}
          href={`/specialities/${specSlug}/${c.slug}#doctors`}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${active === c.slug ? "border-navy bg-navy text-white" : "border-border bg-background text-navy hover:border-navy/30"}`}
        >
          {c.name}
        </A>
      ))}
    </div>
  );
}
