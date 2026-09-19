import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { MapPin, Star, Phone } from "lucide-react";
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
import { getCityBySlugFn } from "@/lib/server-functions/cities";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { getHospitalsFn } from "@/lib/server-functions/hospitals";
import hospitalFallbackImg from "@/assets/hospital-1.jpg";
import doctorFallbackImg from "@/assets/doctor-1.jpg";

export const Route = createFileRoute("/locations/$city")({
  loader: async ({ params }) => {
    const cityRes = await getCityBySlugFn({ data: params.city });
    if (!cityRes.success || !cityRes.city) throw notFound();

    const [doctorsRes, hospitalsRes] = await Promise.all([
      getDoctorsFn({ data: { city: cityRes.city.name, limit: 8, sort: "Rating: High to Low" } }).catch(
        () => null,
      ),
      getHospitalsFn({ data: { city: cityRes.city.name, limit: 4 } }).catch(() => null),
    ]);

    return {
      city: cityRes.city,
      doctors: doctorsRes?.success ? doctorsRes.doctors : [],
      hospitals: hospitalsRes?.success ? hospitalsRes.hospitals : [],
    };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    return {
      meta: [
        { title: `Surgery & Specialist Doctors in ${city?.name ?? "Your City"} | Go Surgery` },
        {
          name: "description",
          content: `Find ${city?.doctorCount ?? 0}+ specialist surgeons and ${city?.hospitalCount ?? 0} hospitals in ${city?.name ?? "your city"}. Book a free consultation.`,
        },
      ],
    };
  },
  component: CityPage,
});

function CityPage() {
  const { city, doctors, hospitals } = Route.useLoaderData();

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
            <a href="/locations" className="hover:text-brand-orange">
              Locations
            </a>
            <span>/</span>
            <span className="font-medium text-ink">{city.name}</span>
          </Container>
        </nav>

        <section className="bg-navy py-14">
          <Container>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-orange" />
              <Eyebrow tone="light">{city.state}</Eyebrow>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Surgery & Specialist Doctors in {city.name}
            </h1>
            <div className="mt-6 flex flex-wrap gap-6">
              {[
                { value: city.hospitalCount, label: "Hospitals" },
                { value: city.doctorCount, label: "Specialist Doctors" },
                { value: city.specialities.length, label: "Specialities" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-brand-orange">{s.value}</p>
                  <p className="mt-0.5 text-xs text-navy-foreground/70">{s.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {city.specialities.length > 0 && (
          <section className="border-b border-border bg-cream py-6">
            <Container>
              <p className="mb-3 text-sm font-semibold text-navy">Available Specialities</p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {city.specialities.map((s) => (
                  <span
                    key={s}
                    className="shrink-0 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-ink/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Container>
          </section>
        )}

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="min-w-0 space-y-14">
            <section>
              <SectionHead
                eyebrow={`${city.hospitalCount} in this city`}
                title={`Hospitals in ${city.name}`}
                action={
                  <Link to="/hospitals">
                    <OutlineButton>View All</OutlineButton>
                  </Link>
                }
              />
              {hospitals.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {hospitals.map((h) => (
                    <article
                      key={h.slug || h.id}
                      className="overflow-hidden rounded-lg border border-border bg-background shadow-sm"
                    >
                      <div className="relative">
                        <img
                          src={h.img || hospitalFallbackImg}
                          alt={h.name}
                          loading="lazy"
                          width={900}
                          height={600}
                          className="h-40 w-full object-cover"
                        />
                        {h.rating && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                            <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />{" "}
                            {h.rating}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-navy">{h.name}</h3>
                        {h.address && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {h.address}
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          {h.slug ? (
                            <Link to="/hospitals/$slug" params={{ slug: h.slug }} className="flex-1">
                              <OutlineButton className="w-full px-2 py-2 text-xs">
                                View Details
                              </OutlineButton>
                            </Link>
                          ) : null}
                          <a href="/contact" className="flex-1">
                            <OrangeButton className="w-full px-2 py-2 text-xs">Book Now</OrangeButton>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hospitals listed here yet.</p>
              )}
            </section>

            <section>
              <SectionHead
                eyebrow={`${city.doctorCount} specialists`}
                title={`Top Doctors in ${city.name}`}
                action={
                  <a href="/doctors" className="text-sm font-semibold text-brand-orange hover:underline">
                    View All Doctors
                  </a>
                }
              />
              {doctors.length > 0 ? (
                <Carousel>
                  {doctors.map((d) => (
                    <article
                      key={d.slug || d.id}
                      className="w-[260px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background sm:w-[300px]"
                    >
                      <div className="relative">
                        <img
                          src={d.img || doctorFallbackImg}
                          alt={d.name}
                          loading="lazy"
                          width={700}
                          height={700}
                          className="h-52 w-full object-cover"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">
                          {d.specialty}
                        </span>
                        {Number(d.rating) > 0 && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                            <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />{" "}
                            {d.rating}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-sm font-bold text-navy">{d.name}</h3>
                        <p className="mt-1.5 text-xs font-semibold text-brand-blue">
                          {d.exp} Years Experience
                        </p>
                        <div className="mt-3 flex gap-2">
                          <a href="tel:18000001234" className="flex-1">
                            <OutlineButton className="w-full px-2 py-2 text-xs">
                              <Phone className="h-3 w-3" /> Call
                            </OutlineButton>
                          </a>
                          {d.slug ? (
                            <Link to="/doctors/$slug" params={{ slug: d.slug }} className="flex-1">
                              <OrangeButton className="w-full px-2 py-2 text-xs">View</OrangeButton>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </Carousel>
              ) : (
                <p className="text-sm text-muted-foreground">No doctors listed here yet.</p>
              )}
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
