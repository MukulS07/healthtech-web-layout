import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Star, MapPin, Phone, Clock, Globe, BedDouble } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import {
  Container,
  SectionHead,
  OrangeButton,
  OutlineButton,
  Carousel,
  Eyebrow,
} from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { getHospitalBySlugFn } from "@/lib/server-functions/hospitals";
import hospitalFallbackImg from "@/assets/hospital-1.jpg";
import { DoctorAvatar } from "@/components/doctors/DoctorCard";
import { SITE, CONSULT_PHRASE } from "@/lib/site";
import { breadcrumbLd, seo } from "@/lib/seo";
import { A } from "@/components/common/A";
import { track } from "@/lib/track";
import { useT } from "@/lib/i18n/context";

export const Route = createFileRoute("/hospitals/$slug")({
  loader: async ({ params }) => {
    const res = await getHospitalBySlugFn({ data: params.slug });
    if (!res.success) throw notFound();
    return res.hospital;
  },
  head: ({ loaderData: h, match }) => {
    if (!h) return {};
    return seo({ locale: match.context.locale,
      title: `${h.name}${h.city ? `, ${h.city}` : ""} — Doctors, Departments & Reviews`,
      description: `${h.name}${h.locality ? `, ${h.locality}` : ""}${h.city ? `, ${h.city}` : ""}: departments${h.doctors.length ? `, ${h.doctors.length} doctors listed` : ""}, location and patient ratings. Request ${CONSULT_PHRASE} via Go Surgery.`,
      path: `/hospitals/${h.slug}`,
      ...(h.img ? { image: h.img } : {}),
      jsonLd: [
        {
          "@type": "Hospital",
          name: h.name,
          url: `${SITE.url}/hospitals/${h.slug}`,
          ...(h.img ? { image: h.img } : {}),
          address: {
            "@type": "PostalAddress",
            ...(h.address ? { streetAddress: h.address } : {}),
            ...(h.city ? { addressLocality: h.city } : {}),
            ...(h.state ? { addressRegion: h.state } : {}),
            ...(h.pincode ? { postalCode: h.pincode } : {}),
            addressCountry: "IN",
          },
          ...(h.departments.length ? { medicalSpecialty: h.departments.slice(0, 20) } : {}),
          ...(h.rating && h.reviewCount
            ? { aggregateRating: { "@type": "AggregateRating", ratingValue: h.rating, reviewCount: h.reviewCount, bestRating: 5 } }
            : {}),
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Hospitals", path: "/hospitals" },
          { name: h.name, path: `/hospitals/${h.slug}` },
        ]),
      ],
    });
  },
  component: HospitalDetail,
});

function HospitalDetail() {
  const t = useT();
  const data = Route.useLoaderData();
  // What the admin Call & WhatsApp report keys this hospital's interactions on.
  const trackTarget = { targetType: "hospital" as const, targetId: data.id, targetName: data.name, city: data.city };

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <A href="/" className="hover:text-brand-orange">
              {t("common.home")}
            </A>
            <span>/</span>
            <A href="/hospitals" className="hover:text-brand-orange">
              {t("nav.hospitals")}
            </A>
            <span>/</span>
            <span className="font-medium text-ink">{data.name}</span>
          </Container>
        </nav>

        <div className="relative h-64 sm:h-80 lg:h-96">
          <img
            src={data.img || hospitalFallbackImg}
            alt={data.name}
            loading="lazy"
            width={1400}
            height={600}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/50" />
          <div className="absolute inset-0 flex items-end">
            <Container className="pb-8">
              {data.emergency24x7 && (
                <span className="inline-block rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
                  {t("hprof.emergency")}
                </span>
              )}
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{data.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                {[data.locality, data.city, data.state].filter(Boolean).join(", ")}
              </p>
            </Container>
          </div>
        </div>

        <div className="border-b border-border bg-cream">
          <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex flex-wrap items-center gap-6">
              {data.rating ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                  <Star className="h-4 w-4 fill-brand-orange text-brand-orange" />{" "}
                  {t("hprof.ratingReviews", { rating: data.rating, count: data.reviewCount })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{t("hprof.noReviews")}</span>
              )}
              {data.totalBeds > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BedDouble className="h-3.5 w-3.5" /> {t("hprof.beds", { n: data.totalBeds })}
                </span>
              )}
              <span className="text-sm text-muted-foreground">{t("hprof.specialists", { n: data.totalDoctors })}</span>
            </div>
            <div className="flex gap-2">
              {data.address && (
                <A
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.name} ${data.address}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track({ type: "directions", ...trackTarget })}
                >
                  <OutlineButton className="px-3 py-2 text-xs">{t("action.getDirections")}</OutlineButton>
                </A>
              )}
              <A href={`/contact?city=${encodeURIComponent(data.city)}`}>
                <OrangeButton className="px-3 py-2 text-xs">{t("hprof.requestConsultation")}</OrangeButton>
              </A>
            </div>
          </Container>
        </div>

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="min-w-0 space-y-12">
            {data.about && (
              <section>
                <h2 className="text-xl font-bold text-navy">{t("hprof.about")}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {data.about}
                </p>
              </section>
            )}

            {(data.emergency24x7 || data.icuBeds > 0 || data.website) && (
              <section>
                <h2 className="text-xl font-bold text-navy">{t("hprof.facilities")}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.emergency24x7 && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-cream px-4 py-3">
                      <Clock className="h-5 w-5 shrink-0 text-brand-orange" />
                      <span className="text-sm font-medium text-ink">{t("hprof.emergency")}</span>
                    </div>
                  )}
                  {data.icuBeds > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-cream px-4 py-3">
                      <BedDouble className="h-5 w-5 shrink-0 text-brand-orange" />
                      <span className="text-sm font-medium text-ink">{t("hprof.icuBeds", { n: data.icuBeds })}</span>
                    </div>
                  )}
                  {data.website && (
                    <A
                      href={data.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-cream px-4 py-3 hover:border-brand-orange"
                    >
                      <Globe className="h-5 w-5 shrink-0 text-brand-orange" />
                      <span className="text-sm font-medium text-ink">{t("hprof.website")}</span>
                    </A>
                  )}
                </div>
              </section>
            )}

            {data.departments.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-navy">{t("hprof.specialties")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.departments.map((s: string) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-ink/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {data.services.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-navy">{t("hprof.services")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.services.map((s: string) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-cream px-4 py-2 text-sm font-medium text-ink/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {data.doctors.length > 0 ? (
              <section>
                <SectionHead
                  eyebrow={t("hprof.meetTeam")}
                  title={t("hprof.doctorsAt")}
                  action={
                    <A href={`/doctors?city=${encodeURIComponent(data.city)}`}>
                      <OutlineButton>{t("home.viewAll")}</OutlineButton>
                    </A>
                  }
                />
                <Carousel>
                  {data.doctors.map((d) => (
                    <article
                      key={d.id}
                      className="w-[220px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background sm:w-[260px]"
                    >
                      <div className="relative">
                        <DoctorAvatar name={d.name} img={d.img} className="h-44 w-full text-4xl" />
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-sm font-bold text-navy">{d.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{d.specialty}</p>
                        {d.experience ? (
                          <p className="mt-1.5 text-xs font-semibold text-brand-blue">{d.experience === 1 ? t("card.exp1") : t("card.exp", { n: d.experience })}</p>
                        ) : null}
                        <div className="mt-3 flex gap-2">
                          {d.slug ? (
                            <Link to="/doctors/$slug" params={{ slug: d.slug }} className="flex-1">
                              <OrangeButton className="w-full px-2 py-1.5 text-xs">
                                {t("action.viewProfile")}
                              </OrangeButton>
                            </Link>
                          ) : (
                            <A href="/contact" className="flex-1">
                              <OrangeButton className="w-full px-2 py-1.5 text-xs">{t("footer.barBook")}</OrangeButton>
                            </A>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </Carousel>
              </section>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("hprof.noRoster")}
              </p>
            )}

            {data.address && (
              <section>
                <h2 className="text-xl font-bold text-navy">{t("hprof.location")}</h2>
                <div className="mt-4 rounded-xl border border-border bg-cream p-5">
                  <p className="flex items-start gap-2 text-sm text-ink/80">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" /> {data.address}
                    {data.pincode ? ` – ${data.pincode}` : ""}
                  </p>
                </div>
              </section>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t("hprof.disclaimer")}
            </p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
            <ConsultForm defaultCity={data.city || undefined} />
            {(data.phone || data.emergencyContact) && (
              <div className="rounded-lg border border-border bg-cream p-4 text-xs text-muted-foreground">
                <Eyebrow>{t("hprof.contact")}</Eyebrow>
                {data.emergencyContact && (
                  <A
                    href={`tel:${data.emergencyContact}`}
                    className="mt-2 flex items-center gap-2 text-sm font-bold text-brand-orange"
                    onClick={() => track({ type: "call", ...trackTarget, targetPhone: data.emergencyContact })}
                  >
                    <Phone className="h-4 w-4" /> {t("hprof.emergencyTag", { phone: data.emergencyContact })}
                  </A>
                )}
                {data.phone && (
                  <A
                    href={`tel:${data.phone}`}
                    className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy"
                    onClick={() => track({ type: "call", ...trackTarget, targetPhone: data.phone })}
                  >
                    <Phone className="h-4 w-4" /> {data.phone}
                  </A>
                )}
              </div>
            )}
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
