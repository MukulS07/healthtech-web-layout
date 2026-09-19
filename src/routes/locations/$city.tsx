import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Breadcrumbs, FaqList, InsuranceEmiBlock, Section } from "@/components/care/Blocks";
import { getCityBySlugFn } from "@/lib/server-functions/cities";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { getHospitalsFn } from "@/lib/server-functions/hospitals";
import { CONSULT_PHRASE, SITE } from "@/lib/site";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";
import hospitalFallbackImg from "@/assets/hospital-1.jpg";

function cityFaqs(name: string, doctorCount: number, hospitalCount: number) {
  return [
    {
      q: `How do I find a good surgeon in ${name}?`,
      a: `Browse surgeons in ${name} by speciality on this page, compare qualifications, experience, hospitals and patient reviews — or fill in the form and our team will suggest suitable specialists for your condition.`,
    },
    {
      q: `How many surgeons and hospitals does ${SITE.name} list in ${name}?`,
      a: `Our directory currently lists ${doctorCount.toLocaleString("en-IN")} surgeons and ${hospitalCount.toLocaleString("en-IN")} hospitals in ${name}. A listing is a directory entry, not an endorsement — our team can help you shortlist.`,
    },
    {
      q: `Can I get cashless surgery in ${name}?`,
      a: `Cashless treatment depends on your insurer and whether the hospital is in its network. Share your policy details and our team will check eligibility before you choose a hospital.`,
    },
    {
      q: `Is the first consultation free?`,
      a: `Yes — your first consultation to discuss your condition and options is free. Book using the form on this page; no account is needed.`,
    },
  ];
}

export const Route = createFileRoute("/locations/$city")({
  loader: async ({ params }) => {
    const cityRes = await getCityBySlugFn({ data: params.city });
    if (!cityRes.success || !cityRes.city) throw notFound();
    const [doctorsRes, hospitalsRes] = await Promise.all([
      getDoctorsFn({ data: { city: cityRes.city.name, limit: 6, sort: "Rating: High to Low" } }).catch(() => null),
      getHospitalsFn({ data: { city: cityRes.city.name, limit: 6 } }).catch(() => null),
    ]);
    return {
      city: cityRes.city,
      doctors: doctorsRes?.success ? doctorsRes.doctors : [],
      hospitals: hospitalsRes?.success ? hospitalsRes.hospitals : [],
    };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    if (!city) return {};
    return seo({
      title: `Surgery & Specialist Surgeons in ${city.name}`,
      description: `Find surgeons in ${city.name} across ${city.specialities.length} specialities — compare doctors and hospitals, read patient reviews and book ${CONSULT_PHRASE} with ${SITE.name}.`,
      path: `/locations/${city.slug}`,
      jsonLd: [
        faqLd(cityFaqs(city.name, city.doctorCount, city.hospitalCount)),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: city.name, path: `/locations/${city.slug}` },
        ]),
      ],
    });
  },
  component: CityPage,
});

function CityPage() {
  const { city, doctors, hospitals } = Route.useLoaderData();
  const cityQ = encodeURIComponent(city.name);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Locations", href: "/locations" }, { name: city.name }]} />

        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {city.name}</span>
            </Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Surgery & Specialist Surgeons in {city.name}</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/80 sm:text-base">
              Planning surgery in {city.name}? Compare surgeons and hospitals by speciality, read what
              patients say, and let our care team help with appointments, insurance and paperwork.
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              {[
                { value: city.doctorCount.toLocaleString("en-IN"), label: "Surgeons listed" },
                { value: city.hospitalCount.toLocaleString("en-IN"), label: "Hospitals listed" },
                { value: String(city.specialities.length), label: "Specialities" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-brand-orange">{s.value}</p>
                  <p className="mt-0.5 text-xs text-navy-foreground/70">{s.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <Container className="grid gap-10 py-10 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="min-w-0 space-y-12">
            {city.specialities.length ? (
              <Section eyebrow="By speciality" title={`Top specialities in ${city.name}`}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {city.specialities.map((s) => (
                    <a key={s.slug} href={`/specialities/${s.slug}/${city.slug}`} className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-cream px-4 py-3 transition-shadow hover:shadow-md">
                      <span>
                        <span className="block text-sm font-bold text-navy group-hover:text-primary">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.count.toLocaleString("en-IN")} surgeons</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange" />
                    </a>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section
              eyebrow="Surgeons"
              title={`Top surgeons in ${city.name}`}
              action={<a href={`/doctors?city=${cityQ}`}><OutlineButton className="px-3 py-2 text-xs">View all {city.doctorCount.toLocaleString("en-IN")}</OutlineButton></a>}
            >
              {doctors.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No surgeons listed here yet — our care team can still help you find one.</p>
              )}
            </Section>

            <Section
              eyebrow="Hospitals"
              title={`Hospitals in ${city.name}`}
              action={<a href={`/hospitals?city=${cityQ}`}><OutlineButton className="px-3 py-2 text-xs">View all</OutlineButton></a>}
            >
              {hospitals.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {hospitals.map((h) => (
                    <a key={h.id} href={`/hospitals/${h.slug}`} className="flex gap-3 rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-md">
                      <img src={h.img || hospitalFallbackImg} alt={h.name} loading="lazy" className="h-16 w-20 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 text-sm font-bold text-navy">{h.name}</h3>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{h.locality || h.address}</p>
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
                <p className="text-sm text-muted-foreground">No hospitals listed here yet.</p>
              )}
            </Section>

            <Section eyebrow="Paying for treatment" title="Insurance & EMI">
              <InsuranceEmiBlock />
            </Section>

            <Section eyebrow="FAQs" title={`Surgery in ${city.name} — FAQs`}>
              <FaqList faqs={cityFaqs(city.name, city.doctorCount, city.hospitalCount)} />
            </Section>

            <div className="rounded-xl bg-navy p-6 text-navy-foreground">
              <p className="text-lg font-bold">Not sure where to start?</p>
              <p className="mt-1 text-sm text-navy-foreground/75">Tell us your symptoms — we'll suggest the right specialist in {city.name}.</p>
              <a href="#book" className="mt-4 inline-block"><OrangeButton>Talk to a care specialist</OrangeButton></a>
            </div>
          </div>

          <aside id="book" className="scroll-mt-40 lg:sticky lg:top-36 lg:self-start">
            <ConsultForm defaultCity={city.name} />
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
