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
import doctorFallbackImg from "@/assets/doctor-1.jpg";

export const Route = createFileRoute("/hospitals/$slug")({
  loader: async ({ params }) => {
    const res = await getHospitalBySlugFn({ data: params.slug });
    if (!res.success) throw notFound();
    return res.hospital;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Hospital"} — ${loaderData?.city ?? ""} | Go Surgery` },
      {
        name: "description",
        content: `${loaderData?.name ?? "Hospital"} in ${loaderData?.city ?? "India"}. ${loaderData?.totalBeds || 0} beds, ${loaderData?.totalDoctors || 0} specialists.`,
      },
    ],
  }),
  component: HospitalDetail,
});

function HospitalDetail() {
  const data = Route.useLoaderData();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">
              Home
            </a>
            <span>/</span>
            <a href="/hospitals" className="hover:text-brand-orange">
              Hospitals
            </a>
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
                  24/7 Emergency
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
                  <Star className="h-4 w-4 fill-brand-orange text-brand-orange" /> {data.rating} (
                  {data.reviewCount} patient reviews)
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No reviews yet</span>
              )}
              {data.totalBeds > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BedDouble className="h-3.5 w-3.5" /> {data.totalBeds} Beds
                </span>
              )}
              <span className="text-sm text-muted-foreground">{data.totalDoctors} Specialists</span>
            </div>
            <div className="flex gap-2">
              {data.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.name} ${data.address}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <OutlineButton className="px-3 py-2 text-xs">Get Directions</OutlineButton>
                </a>
              )}
              <a href="/contact">
                <OrangeButton className="px-3 py-2 text-xs">Book Now</OrangeButton>
              </a>
            </div>
          </Container>
        </div>

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="min-w-0 space-y-12">
            {data.about && (
              <section>
                <h2 className="text-xl font-bold text-navy">About the Hospital</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {data.about}
                </p>
              </section>
            )}

            {(data.emergency24x7 || data.icuBeds > 0 || data.website) && (
              <section>
                <h2 className="text-xl font-bold text-navy">Facilities</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.emergency24x7 && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-cream px-4 py-3">
                      <Clock className="h-5 w-5 shrink-0 text-brand-orange" />
                      <span className="text-sm font-medium text-ink">24/7 Emergency</span>
                    </div>
                  )}
                  {data.icuBeds > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-cream px-4 py-3">
                      <BedDouble className="h-5 w-5 shrink-0 text-brand-orange" />
                      <span className="text-sm font-medium text-ink">{data.icuBeds} ICU Beds</span>
                    </div>
                  )}
                  {data.website && (
                    <a
                      href={data.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-cream px-4 py-3 hover:border-brand-orange"
                    >
                      <Globe className="h-5 w-5 shrink-0 text-brand-orange" />
                      <span className="text-sm font-medium text-ink">Visit Website</span>
                    </a>
                  )}
                </div>
              </section>
            )}

            {data.departments.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-navy">Specialties Available</h2>
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
                <h2 className="text-xl font-bold text-navy">Services</h2>
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
                  eyebrow="Meet the team"
                  title="Doctors at This Hospital"
                  action={
                    <Link to="/doctors">
                      <OutlineButton>View All</OutlineButton>
                    </Link>
                  }
                />
                <Carousel>
                  {data.doctors.map((d) => (
                    <article
                      key={d.id}
                      className="w-[220px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background sm:w-[260px]"
                    >
                      <div className="relative">
                        <img
                          src={d.img || doctorFallbackImg}
                          alt={d.name}
                          loading="lazy"
                          width={700}
                          height={700}
                          className="h-44 w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-sm font-bold text-navy">{d.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{d.specialty}</p>
                        <p className="mt-1.5 text-xs font-semibold text-brand-blue">
                          {d.experience} Years Experience
                        </p>
                        <div className="mt-3 flex gap-2">
                          {d.slug ? (
                            <Link to="/doctors/$slug" params={{ slug: d.slug }} className="flex-1">
                              <OrangeButton className="w-full px-2 py-1.5 text-xs">
                                View Profile
                              </OrangeButton>
                            </Link>
                          ) : (
                            <a href="/contact" className="flex-1">
                              <OrangeButton className="w-full px-2 py-1.5 text-xs">Book</OrangeButton>
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </Carousel>
              </section>
            ) : (
              <p className="text-sm text-muted-foreground">
                Doctor roster for this hospital isn't available yet.
              </p>
            )}

            {data.address && (
              <section>
                <h2 className="text-xl font-bold text-navy">Location</h2>
                <div className="mt-4 rounded-xl border border-border bg-cream p-5">
                  <p className="flex items-start gap-2 text-sm text-ink/80">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" /> {data.address}
                    {data.pincode ? ` – ${data.pincode}` : ""}
                  </p>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ConsultForm />
            {(data.phone || data.emergencyContact) && (
              <div className="rounded-lg border border-border bg-cream p-4 text-xs text-muted-foreground">
                <Eyebrow>Contact</Eyebrow>
                {data.emergencyContact && (
                  <a
                    href={`tel:${data.emergencyContact}`}
                    className="mt-2 flex items-center gap-2 text-sm font-bold text-brand-orange"
                  >
                    <Phone className="h-4 w-4" /> {data.emergencyContact} (Emergency)
                  </a>
                )}
                {data.phone && (
                  <a
                    href={`tel:${data.phone}`}
                    className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy"
                  >
                    <Phone className="h-4 w-4" /> {data.phone}
                  </a>
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
