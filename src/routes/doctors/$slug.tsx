import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { BadgeCheck, Briefcase, CheckCircle2, Languages, MapPin, Navigation, PenLine, Phone, Quote, Star } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { DoctorAvatar } from "@/components/doctors/DoctorCard";
import { Breadcrumbs, Section } from "@/components/care/Blocks";
import { getDoctorBySlugFn } from "@/lib/server-functions/doctors";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import { getTreatment } from "@/data/catalog";
import { BOOK_LABEL, CONSULT_PHRASE, promiseEnabled, SITE, telHref } from "@/lib/site";
import { breadcrumbLd, seo } from "@/lib/seo";
import { A } from "@/components/common/A";
import { track } from "@/lib/track";
import { useT } from "@/lib/i18n/context";

export const Route = createFileRoute("/doctors/$slug")({
  loader: async ({ params }) => {
    const doctorRes = await getDoctorBySlugFn({ data: params.slug });
    if (!doctorRes.success || !doctorRes.doctor) throw notFound();
    const reviewsRes = await getReviewsFn({ data: { doctorId: doctorRes.doctor.id, limit: 6 } }).catch(() => null);
    return {
      doctor: doctorRes.doctor,
      reviews: reviewsRes?.success ? reviewsRes.reviews : [],
      reviewTotal: reviewsRes?.success ? reviewsRes.totalReviews : 0,
      reviewAverage: reviewsRes?.success ? reviewsRes.averageRating : 0,
    };
  },
  head: ({ loaderData, match }) => {
    const d = loaderData?.doctor;
    if (!d) return {};
    const place = d.city ? ` in ${d.city}` : "";
    const rating =
      loaderData.reviewTotal > 0
        ? { "@type": "AggregateRating", ratingValue: loaderData.reviewAverage, reviewCount: loaderData.reviewTotal, bestRating: 5, worstRating: 1 }
        : undefined;
    return seo({ locale: match.context.locale,
      title: `${d.name}${d.specialty ? ` — ${d.specialty}` : ""}${place}`,
      description: `${d.name}${d.specialty ? `, ${d.specialty}` : ""}${place}.${d.cred ? ` ${d.cred}.` : ""}${d.exp ? ` ${d.exp} years of experience.` : ""} See hospitals, reviews and book ${CONSULT_PHRASE}.`,
      path: `/doctors/${d.slug}`,
      type: "profile",
      ...(d.img ? { image: d.img } : {}),
      // Profiles outside our surgical specialities stay reachable but aren't promoted in search.
      noindex: !d.specialitySlug,
      jsonLd: [
        {
          "@type": "Physician",
          name: d.name,
          url: `${SITE.url}/doctors/${d.slug}`,
          ...(d.img ? { image: d.img } : {}),
          ...(d.specialityName ? { medicalSpecialty: d.specialityName } : {}),
          ...(d.cred ? { hasCredential: d.cred } : {}),
          ...(d.city ? { address: { "@type": "PostalAddress", addressLocality: d.city, addressCountry: "IN" } } : {}),
          ...(d.hospitals.length
            ? { hospitalAffiliation: d.hospitals.filter((h) => h.name).map((h) => ({ "@type": "Hospital", name: h.name, address: h.address || h.city })) }
            : {}),
          ...(d.languages.length ? { knowsLanguage: d.languages } : {}),
          ...(rating ? { aggregateRating: rating } : {}),
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Doctors", path: "/doctors" },
          { name: d.name, path: `/doctors/${d.slug}` },
        ]),
      ],
    });
  },
  component: DoctorProfile,
});

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={n <= Math.round(value) ? "h-3.5 w-3.5 fill-brand-orange text-brand-orange" : "h-3.5 w-3.5 text-border"} />
      ))}
    </span>
  );
}

/** An "about" paragraph assembled only from the doctor's real, structured fields. */
function aboutText(d: {
  name: string;
  specialty: string;
  city: string;
  exp: number | null;
  cred: string;
  hospitals: { name: string }[];
  languages: string[];
}) {
  const parts = [
    `${d.name} is ${d.specialty ? `a ${d.specialty.toLowerCase()}` : "a doctor"}${d.city ? ` based in ${d.city}` : ""}${d.exp ? ` with ${d.exp} years of experience` : ""}.`,
  ];
  if (d.cred) parts.push(`Qualifications: ${d.cred}.`);
  const hosp = d.hospitals.map((h) => h.name).filter(Boolean);
  if (hosp.length) parts.push(`Practises at ${hosp.slice(0, 3).join(", ")}${hosp.length > 3 ? ` and ${hosp.length - 3} more` : ""}.`);
  if (d.languages.length) parts.push(`Consults in ${d.languages.join(", ")}.`);
  return parts.join(" ");
}

function DoctorProfile() {
  const t = useT();
  const { doctor: d, reviews, reviewTotal, reviewAverage } = Route.useLoaderData();
  const procedures = d.surgeryTypes.map((s: string) => ({ slug: s, treatment: getTreatment(s), label: s.replace(/-/g, " ") }));

  // One profile view per doctor per page load — the admin analytics compare views against calls.
  useEffect(() => {
    track({ type: "profile_click", targetType: "doctor", targetId: d.id, targetName: d.name, city: d.city });
  }, [d.id, d.name, d.city]);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs
          items={[
            { name: t("common.home"), href: "/" },
            { name: t("nav.doctors"), href: "/doctors" },
            ...(d.specialitySlug ? [{ name: d.specialityName ?? "", href: `/doctors?specialty=${d.specialitySlug}` }] : []),
            { name: d.name },
          ]}
        />

        <section className="bg-navy py-10">
          <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <DoctorAvatar name={d.name} initials={d.initials} img={d.img} className="h-32 w-32 shrink-0 rounded-xl text-4xl sm:h-40 sm:w-40" />
            <div className="min-w-0">
              {d.specialty ? <Eyebrow tone="light">{d.specialty}</Eyebrow> : null}
              <h1 className="mt-1.5 text-2xl font-bold text-navy-foreground sm:text-3xl">{d.name}</h1>
              {d.cred ? <p className="mt-1 text-sm text-navy-foreground/75">{d.cred}</p> : null}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {reviewTotal > 0 ? (
                  <span className="flex items-center gap-1.5 font-semibold text-brand-orange">
                    <Star className="h-4 w-4 fill-brand-orange" /> {t("prof.ratingReviews", { rating: reviewAverage, n: reviewTotal })}
                  </span>
                ) : null}
                {d.exp ? (
                  <span className="flex items-center gap-1.5 text-navy-foreground/80">
                    <Briefcase className="h-4 w-4 text-brand-orange" /> {d.exp === 1 ? t("card.exp1") : t("card.exp", { n: d.exp })}
                  </span>
                ) : null}
                {d.city ? (
                  <span className="flex items-center gap-1.5 text-navy-foreground/80">
                    <MapPin className="h-4 w-4 text-brand-orange" /> {[d.locality, d.city].filter(Boolean).join(", ")}
                  </span>
                ) : null}
                {d.registrationNumber ? (
                  <span className="flex items-center gap-1.5 text-navy-foreground/80">
                    <BadgeCheck className="h-4 w-4 text-brand-orange" /> {t("prof.regNo", { no: d.registrationNumber })}
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <A href="#book"><OrangeButton>{promiseEnabled("free-consult") ? BOOK_LABEL : t("action.book")}</OrangeButton></A>
                <A
                  href={telHref}
                  onClick={() =>
                    track({ type: "call", targetType: "doctor", targetId: d.id, targetName: d.name, city: d.city })
                  }
                >
                  <OutlineButton tone="light"><Phone className="h-4 w-4" /> {t("prof.callNumber", { phone: SITE.phone.display })}</OutlineButton>
                </A>
              </div>
            </div>
          </Container>
        </section>

        <Container className="grid gap-10 py-10 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="min-w-0 space-y-12">
            <Section eyebrow={t("prof.eyebrowProfile")} title={t("prof.aboutTitle", { name: d.name })}>
              <p className="text-sm leading-relaxed text-ink/85 sm:text-base">{d.bio || aboutText(d)}</p>
              {d.languages.length ? (
                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Languages className="h-4 w-4 text-primary" />
                  {d.languages.map((l: string) => (
                    <span key={l} className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-navy">{l}</span>
                  ))}
                </p>
              ) : null}
            </Section>

            {procedures.length ? (
              <Section eyebrow={t("prof.eyebrowProcedures")} title={t("prof.proceduresTitle")}>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {procedures.map((p) => (
                    <li key={p.slug} className="flex items-center gap-2 text-sm capitalize text-ink/85">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {p.treatment ? <A href={`/treatments/${p.treatment.slug}`} className="hover:text-primary hover:underline">{p.treatment.name}</A> : p.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-muted-foreground">{t("prof.asListed")}</p>
              </Section>
            ) : null}

            {d.hospitals.length ? (
              <Section eyebrow={t("prof.eyebrowWhere")} title={t("prof.hospitalsTitle")}>
                <div className="space-y-3">
                  {d.hospitals.map((h) => (
                    <div key={h.id || h.name} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-cream p-4">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-navy">{h.name}</p>
                        <p className="text-xs text-muted-foreground">{h.address || [h.locality, h.city].filter(Boolean).join(", ")}</p>
                        {h.consultationFee > 0 ? <p className="mt-1 text-xs text-muted-foreground">{t("prof.consultFee", { fee: h.consultationFee })}</p> : null}
                      </div>
                      <div className="flex gap-2">
                        <A
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([h.name, h.address || h.locality, h.city].filter(Boolean).join(", "))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OutlineButton className="gap-1 px-3 py-1.5 text-xs"><Navigation className="h-3 w-3" /> {t("prof.map")}</OutlineButton>
                        </A>
                        {h.slug ? <A href={`/hospitals/${h.slug}`}><OutlineButton className="px-3 py-1.5 text-xs">{t("prof.view")}</OutlineButton></A> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section
              eyebrow={t("prof.eyebrowFeedback")}
              title={t("prof.whatSay")}
              action={<A href={`/reviews/write?doctor=${d.slug}`}><OutlineButton className="gap-1.5 px-3 py-2 text-xs"><PenLine className="h-3.5 w-3.5" /> {t("action.writeReview")}</OutlineButton></A>}
            >
              {reviewTotal > 0 ? (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-cream p-4">
                  <p className="text-3xl font-extrabold text-navy">{reviewAverage}</p>
                  <div>
                    <Stars value={reviewAverage} />
                    <p className="text-xs text-muted-foreground">{t("prof.nReviews", { n: reviewTotal })}</p>
                  </div>
                </div>
              ) : null}
              {reviews.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-background p-5">
                      <div className="flex items-center justify-between">
                        <Quote className="h-5 w-5 text-brand-orange" />
                        <Stars value={r.rating} />
                      </div>
                      <p className="mt-3 text-sm text-ink/80">"{r.comment}"</p>
                      <p className="mt-3 text-xs font-semibold text-navy">
                        — {r.patientName}
                        <span className="font-normal text-muted-foreground"> · {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("prof.noReviews")}</p>
              )}
            </Section>
          </div>

          <aside id="book" className="scroll-mt-40 space-y-4 lg:sticky lg:top-36 lg:self-start">
            {d.fees > 0 && promiseEnabled("free-consult") ? (
              <div className="rounded-lg border border-primary/30 bg-cream p-4">
                <p className="text-sm font-semibold text-navy">First consultation via {SITE.name}</p>
                <p className="mt-1 text-lg font-bold">
                  <span className="mr-2 text-muted-foreground line-through">₹{d.fees}</span>
                  <span className="text-primary">FREE</span>
                </p>
              </div>
            ) : null}
            <ConsultForm doctorName={d.name} defaultCity={d.city || undefined} defaultInterest={d.specialitySlug ? `s:${d.specialitySlug}` : undefined} />
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
