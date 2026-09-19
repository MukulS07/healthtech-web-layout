import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, BedDouble, CheckCircle2, Clock, Syringe, TimerReset } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Breadcrumbs, FaqList, InsuranceEmiBlock, MedicalDisclaimer, Section } from "@/components/care/Blocks";
import {
  conditionsForTreatment,
  getSpeciality,
  getTreatment,
  treatmentFaqs,
  treatmentsForSpeciality,
} from "@/data/catalog";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { CITIES } from "@/lib/site";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/treatments/$slug")({
  loader: async ({ params }) => {
    const t = getTreatment(params.slug);
    if (!t) throw notFound();
    if (t.slug !== params.slug) {
      throw redirect({ to: "/treatments/$slug", params: { slug: t.slug }, statusCode: 301 });
    }
    const doctors = await getDoctorsFn({ data: { specialty: t.speciality, limit: 3, sort: "Rating: High to Low" } }).catch(() => null);
    return { slug: t.slug, doctors: doctors?.success ? doctors.doctors : [] };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? getTreatment(loaderData.slug) : undefined;
    if (!t) return {};
    const spec = getSpeciality(t.speciality);
    return seo({
      title: `${t.name} — Procedure, Recovery & Best Surgeons`,
      description: `${t.summary.split(". ")[0]}. Learn who needs it, how it's done, recovery time and insurance cover, and book a free consultation.`,
      path: `/treatments/${t.slug}`,
      jsonLd: [
        {
          "@type": "MedicalProcedure",
          name: t.name,
          alternateName: t.aka,
          description: t.summary,
          procedureType: "https://schema.org/SurgicalProcedure",
          howPerformed: t.steps.join(" "),
          preparation: `Anaesthesia: ${t.anaesthesia}.`,
          followup: t.recovery,
          ...(spec ? { relevantSpecialty: spec.name } : {}),
        },
        faqLd(treatmentFaqs(t)),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Treatments", path: "/treatments" },
          ...(spec ? [{ name: spec.name, path: `/specialities/${spec.slug}` }] : []),
          { name: t.name, path: `/treatments/${t.slug}` },
        ]),
      ],
    });
  },
  component: TreatmentPage,
});

function TreatmentPage() {
  const { slug, doctors } = Route.useLoaderData();
  const t = getTreatment(slug)!;
  const spec = getSpeciality(t.speciality)!;
  const conditions = conditionsForTreatment(t);
  const related = treatmentsForSpeciality(t.speciality).filter((x) => x.slug !== t.slug).slice(0, 6);
  const facts = [
    { icon: Syringe, label: "Anaesthesia", value: t.anaesthesia },
    { icon: Clock, label: "Procedure time", value: t.duration },
    { icon: BedDouble, label: "Hospital stay", value: t.stay },
    { icon: TimerReset, label: "Recovery", value: t.recovery },
  ];

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Treatments", href: "/treatments" },
            { name: spec.name, href: `/specialities/${spec.slug}` },
            { name: t.name },
          ]}
        />
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{spec.name} treatment</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">{t.name}</h1>
            {t.aka?.length ? <p className="mt-1 text-sm text-navy-foreground/60">Also known as: {t.aka.join(", ")}</p> : null}
            <p className="mt-3 max-w-3xl text-sm text-navy-foreground/80 sm:text-base">{t.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book"><OrangeButton>Book Free Consultation</OrangeButton></a>
              <a href={`/doctors?specialty=${spec.slug}`}><OutlineButton tone="light">Find a surgeon</OutlineButton></a>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="min-w-0 space-y-12">
              <div className="grid gap-3 sm:grid-cols-2">
                {facts.map((f) => (
                  <div key={f.label} className="flex gap-3 rounded-xl border border-border bg-cream p-4">
                    <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-navy">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="-mt-8 text-[11px] text-muted-foreground">Typical ranges — your surgeon will tell you what to expect in your case.</p>

              <Section eyebrow="Is it for you?" title={`Who needs ${t.name}?`}>
                <ul className="space-y-2">
                  {t.indications.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink/85 sm:text-base">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {i}
                    </li>
                  ))}
                </ul>
                {conditions.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Conditions treated:</span>
                    {conditions.map((c) => (
                      <a key={c.slug} href={`/conditions/${c.slug}`} className="rounded-full border border-border bg-cream px-3 py-1 text-xs font-semibold text-navy hover:border-primary/40">{c.name}</a>
                    ))}
                  </div>
                ) : null}
              </Section>

              <Section eyebrow="The procedure" title={`How ${t.name} is performed`}>
                <ol className="space-y-3">
                  {t.steps.map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>
                      <p className="pt-0.5 text-sm text-ink/85 sm:text-base">{s}</p>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section eyebrow="Recovery" title="Recovery and aftercare">
                <p className="text-sm leading-relaxed text-ink/85 sm:text-base">{t.recovery}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/85 sm:text-base">
                  Follow your surgeon's instructions on wound care, medicines, diet and activity, and
                  attend your follow-up review. Contact your care team promptly if you develop fever,
                  worsening pain, bleeding, or anything that doesn't feel right.
                </p>
              </Section>

              <Section eyebrow="Safety" title="Possible risks">
                <p className="mb-3 text-sm text-muted-foreground">
                  Every procedure carries some risk. Your surgeon will explain how these apply to you. Possible risks include:
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {t.risks.map((r) => (
                    <li key={r} className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm text-ink/85">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" /> {r}
                    </li>
                  ))}
                </ul>
              </Section>

              {doctors.length ? (
                <Section
                  eyebrow="Specialists"
                  title={`${spec.name} surgeons`}
                  action={<a href={`/doctors?specialty=${spec.slug}`}><OutlineButton className="px-3 py-2 text-xs">View all</OutlineButton></a>}
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
                  </div>
                </Section>
              ) : null}

              <Section eyebrow="Paying for treatment" title="Insurance & EMI">
                <InsuranceEmiBlock />
              </Section>

              <Section eyebrow="FAQs" title={`${t.name} — frequently asked questions`}>
                <FaqList faqs={treatmentFaqs(t)} />
              </Section>

              {related.length ? (
                <Section eyebrow="Related" title={`Other ${spec.name} treatments`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {related.map((r) => (
                      <a key={r.slug} href={`/treatments/${r.slug}`} className="group flex items-center justify-between rounded-lg border border-border bg-cream px-4 py-3">
                        <span className="text-sm font-semibold text-navy">{r.name}</span>
                        <ArrowRight className="h-4 w-4 text-brand-orange" />
                      </a>
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section eyebrow="Near you" title={`${t.name} in top cities`}>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <a key={c.slug} href={`/specialities/${spec.slug}/${c.slug}`} className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary/40">
                      {spec.name} in {c.name}
                    </a>
                  ))}
                </div>
              </Section>

              <MedicalDisclaimer />
            </div>

            <aside id="book" className="scroll-mt-40 lg:sticky lg:top-36 lg:self-start">
              <ConsultForm defaultInterest={`t:${t.slug}`} />
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
