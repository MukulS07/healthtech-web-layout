import { createFileRoute, notFound } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Microscope, Stethoscope } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Breadcrumbs, FaqList, InsuranceEmiBlock, MedicalDisclaimer, Section } from "@/components/care/Blocks";
import { conditionFaqs, CONDITIONS, getCondition, getSpeciality, treatmentsForCondition } from "@/data/catalog";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { CITIES } from "@/lib/site";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/conditions/$slug")({
  loader: async ({ params }) => {
    const c = getCondition(params.slug);
    if (!c) throw notFound();
    const doctors = await getDoctorsFn({ data: { specialty: c.speciality, limit: 3, sort: "Rating: High to Low" } }).catch(() => null);
    return { slug: c.slug, doctors: doctors?.success ? doctors.doctors : [] };
  },
  head: ({ loaderData }) => {
    const c = loaderData ? getCondition(loaderData.slug) : undefined;
    if (!c) return {};
    const spec = getSpeciality(c.speciality);
    return seo({
      title: `${c.name} — Symptoms, Causes & Treatment`,
      description: `${c.summary.split(". ")[0]}. Symptoms, causes, diagnosis and treatment options — and when to see a doctor.`,
      path: `/conditions/${c.slug}`,
      jsonLd: [
        {
          "@type": "MedicalWebPage",
          name: c.name,
          about: {
            "@type": "MedicalCondition",
            name: c.name,
            alternateName: c.aka,
            description: c.summary,
            signOrSymptom: c.symptoms.map((s) => ({ "@type": "MedicalSignOrSymptom", name: s })),
            cause: c.causes.map((s) => ({ "@type": "MedicalCause", name: s })),
            possibleTreatment: treatmentsForCondition(c).map((t) => ({ "@type": "MedicalProcedure", name: t.name })),
            ...(spec ? { relevantSpecialty: spec.name } : {}),
          },
        },
        faqLd(conditionFaqs(c)),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Conditions", path: "/conditions" },
          { name: c.name, path: `/conditions/${c.slug}` },
        ]),
      ],
    });
  },
  component: ConditionPage,
});

function List({ items, icon: Icon }: { items: string[]; icon: typeof CheckCircle2 }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm text-ink/85">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {i}
        </li>
      ))}
    </ul>
  );
}

function ConditionPage() {
  const { slug, doctors } = Route.useLoaderData();
  const c = getCondition(slug)!;
  const spec = getSpeciality(c.speciality)!;
  const treatments = treatmentsForCondition(c);
  const related = CONDITIONS.filter((x) => x.speciality === c.speciality && x.slug !== c.slug).slice(0, 6);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Conditions", href: "/conditions" }, { name: c.name }]} />
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{spec.name} condition</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">{c.name}</h1>
            {c.aka?.length ? <p className="mt-1 text-sm text-navy-foreground/60">Also called: {c.aka.join(", ")}</p> : null}
            <p className="mt-3 max-w-3xl text-sm text-navy-foreground/80 sm:text-base">{c.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book"><OrangeButton>Book Free Consultation</OrangeButton></a>
              <a href={`/specialities/${spec.slug}`}><OutlineButton tone="light">About {spec.name}</OutlineButton></a>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="min-w-0 space-y-12">
              <Section eyebrow="Symptoms" title={`Symptoms of ${c.name}`}>
                <List items={c.symptoms} icon={CheckCircle2} />
              </Section>
              <Section eyebrow="Causes" title="What causes it?">
                <List items={c.causes} icon={CheckCircle2} />
              </Section>
              <Section eyebrow="Diagnosis" title="How it's diagnosed">
                <List items={c.diagnosis} icon={Microscope} />
              </Section>
              {c.selfCare?.length ? (
                <Section eyebrow="Self-care" title="What you can do at home">
                  <List items={c.selfCare} icon={CheckCircle2} />
                </Section>
              ) : null}

              {treatments.length ? (
                <Section eyebrow="Treatment" title={`Treatment options for ${c.name}`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {treatments.map((t) => (
                      <a key={t.slug} href={`/treatments/${t.slug}`} className="group rounded-lg border border-border bg-cream p-4 transition-shadow hover:shadow-md">
                        <h3 className="flex items-center justify-between text-sm font-bold text-navy">
                          {t.name} <ArrowRight className="h-4 w-4 text-brand-orange" />
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.summary}</p>
                        <p className="mt-2 text-[11px] font-semibold text-primary">Stay: {t.stay}</p>
                      </a>
                    ))}
                  </div>
                </Section>
              ) : null}

              <div className="flex items-start gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange-soft p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
                <div>
                  <p className="text-sm font-bold text-navy">When to see a doctor</p>
                  <p className="mt-1 text-sm text-ink/85">{c.whenToSee}</p>
                </div>
              </div>

              {doctors.length ? (
                <Section
                  eyebrow="Specialists"
                  title={`Doctors who treat ${c.name}`}
                  action={
                    <a href={`/doctors?specialty=${spec.slug}`}>
                      <OutlineButton className="px-3 py-2 text-xs">View all</OutlineButton>
                    </a>
                  }
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {doctors.map((d) => (
                      <DoctorCard key={d.id} doctor={d} />
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section eyebrow="Paying for treatment" title="Insurance & EMI">
                <InsuranceEmiBlock />
              </Section>

              <Section eyebrow="FAQs" title={`${c.name} — frequently asked questions`}>
                <FaqList faqs={conditionFaqs(c)} />
              </Section>

              <Section eyebrow="Near you" title={`${c.name} treatment in top cities`}>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <a
                      key={city.slug}
                      href={`/specialities/${spec.slug}/${city.slug}`}
                      className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary/40"
                    >
                      {spec.name} in {city.name}
                    </a>
                  ))}
                </div>
              </Section>

              {related.length ? (
                <Section eyebrow="Related" title={`Other ${spec.name} conditions`}>
                  <div className="flex flex-wrap gap-2">
                    {related.map((r) => (
                      <a
                        key={r.slug}
                        href={`/conditions/${r.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary/40"
                      >
                        <Stethoscope className="h-3 w-3 text-primary" /> {r.name}
                      </a>
                    ))}
                  </div>
                </Section>
              ) : null}

              <MedicalDisclaimer />
            </div>
            <aside id="book" className="scroll-mt-40 lg:sticky lg:top-36 lg:self-start">
              <ConsultForm defaultInterest={`c:${c.slug}`} />
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
