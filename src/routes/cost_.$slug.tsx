import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, BedDouble, Clock, IndianRupee, ShieldCheck, Syringe } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { Breadcrumbs, FaqList, InsuranceEmiBlock, MedicalDisclaimer, Section } from "@/components/care/Blocks";
import { getSpeciality, getTreatment, treatmentsForSpeciality } from "@/data/catalog";
import { COST_SOURCE_LABELS, costFor, formatRupees } from "@/data/cost";
import { CITIES, COSTS_PUBLISHED, BOOK_LABEL } from "@/lib/site";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";

/** Cost pages mirror /treatments/$slug but answer the money question first. */
export const Route = createFileRoute("/cost_/$slug")({
  loader: ({ params }) => {
    const slug = params.slug.replace(/-cost$/, "");
    const t = getTreatment(slug);
    if (!t) throw notFound();
    if (t.slug !== params.slug) {
      throw redirect({ to: "/cost/$slug", params: { slug: t.slug }, statusCode: 301 });
    }
    return { slug: t.slug };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? getTreatment(loaderData.slug) : undefined;
    if (!t) return {};
    const spec = getSpeciality(t.speciality);
    return seo({
      title: `${t.name} Cost in India`,
      description: `What affects the cost of ${t.name.toLowerCase()} in India — hospital, city, room category, technique and insurance cover — and how to get an estimate for your own case.`,
      path: `/cost/${t.slug}`,
      jsonLd: [
        faqLd(costFaqs(t.name)),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Surgery cost", path: "/cost" },
          ...(spec ? [{ name: spec.name, path: `/specialities/${spec.slug}` }] : []),
          { name: `${t.name} cost`, path: `/cost/${t.slug}` },
        ]),
      ],
    });
  },
  component: TreatmentCostPage,
});

function costFaqs(name: string) {
  return [
    {
      q: `What does ${name.toLowerCase()} cost in India?`,
      a: "The price depends on the hospital and city, the room category, the technique your surgeon uses, and how much of it your insurance covers. Ask the hospital for a written estimate before admission — our team can help you request one.",
    },
    {
      q: "Is the cost covered by insurance?",
      a: "Many planned surgical procedures are covered when they are medically necessary and your policy is active beyond any waiting period. Cashless treatment also depends on the hospital being in your insurer's network. Share your policy details and our team will check it for you.",
    },
    {
      q: "What is usually included in a hospital's estimate?",
      a: "Estimates commonly include the surgeon's fee, anaesthesia, operating theatre charges, the room for the expected stay and routine medicines. Tests before surgery, implants, a longer stay or treating complications are usually charged separately — ask what is excluded.",
    },
    {
      q: "Can I pay in instalments?",
      a: "Some hospitals and lenders offer EMI plans. Eligibility and terms are set by the lender, not by us — ask our team what is available for your hospital.",
    },
  ];
}

const INCLUDED = [
  "Surgeon and anaesthetist fees",
  "Operating theatre and consumables",
  "Room charges for the expected length of stay",
  "Routine medicines and nursing during admission",
];
const EXCLUDED = [
  "Tests and consultations before admission",
  "Implants, meshes or special devices, where used",
  "Extra days in hospital, or ICU if needed",
  "Treating complications, and medicines after discharge",
];

function TreatmentCostPage() {
  const { slug } = Route.useLoaderData();
  const t = getTreatment(slug)!;
  const spec = getSpeciality(t.speciality)!;
  const band = costFor(t.slug);
  const showBand = COSTS_PUBLISHED && band?.verified;
  const related = treatmentsForSpeciality(t.speciality).filter((x) => x.slug !== t.slug).slice(0, 6);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Surgery cost", href: "/cost" },
            { name: spec.name, href: `/specialities/${spec.slug}` },
            { name: `${t.name} cost` },
          ]}
        />

        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{spec.name} · Cost guide</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">{t.name} cost in India</h1>

            {showBand && band ? (
              <div className="mt-5 inline-flex flex-col rounded-xl bg-background/95 p-5 shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Typical range</span>
                <span className="mt-1 text-2xl font-bold text-navy sm:text-3xl">
                  {formatRupees(band.min)} – {formatRupees(band.max)}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {COST_SOURCE_LABELS[band.source]}
                  {band.updatedAt ? ` · checked ${new Date(band.updatedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}
                  . Your own quote comes from the hospital you choose.
                </span>
              </div>
            ) : (
              <div className="mt-5 max-w-2xl rounded-xl bg-background/95 p-5 shadow-lg">
                <p className="text-sm font-bold text-navy">We don't publish a price for this procedure yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'd rather show you nothing than a number that isn't yours. Costs differ by hospital,
                  city, room category and technique — tell us your case and we'll help you get a written
                  estimate from the hospital, and check what your insurance covers.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book"><OrangeButton>Ask for an estimate</OrangeButton></a>
              <a href={`/treatments/${t.slug}`}><OutlineButton tone="light">About the procedure</OutlineButton></a>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="min-w-0 space-y-12">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Syringe, label: "Anaesthesia", value: t.anaesthesia },
                  { icon: Clock, label: "Procedure time", value: t.duration },
                  { icon: BedDouble, label: "Hospital stay", value: t.stay },
                ].map((f) => (
                  <div key={f.label} className="flex gap-3 rounded-xl border border-border bg-cream p-4">
                    <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-navy">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="-mt-8 text-[11px] text-muted-foreground">
                A longer stay or a different technique changes the final bill — these are typical figures, not promises.
              </p>

              <Section eyebrow="What drives the price" title={`What affects the cost of ${t.name.toLowerCase()}`}>
                <ul className="space-y-2">
                  {[
                    "The hospital and the city — a metro corporate hospital costs more than a smaller nursing home.",
                    "Room category: general ward, shared or private.",
                    "The technique your surgeon recommends (open, laparoscopic or laser) and any implants used.",
                    "Your surgeon's experience.",
                    "Whether your insurance covers the procedure, and whether the hospital is in its network.",
                    "Your own medical situation — other conditions can mean more tests or a longer stay.",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink/85 sm:text-base">
                      <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section eyebrow="The estimate" title="What's usually included — and what isn't">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-cream p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                      <ShieldCheck className="h-4 w-4 text-primary" /> Usually included
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {INCLUDED.map((i) => <li key={i}>• {i}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-cream p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                      <AlertTriangle className="h-4 w-4 text-brand-orange" /> Usually extra
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {EXCLUDED.map((i) => <li key={i}>• {i}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Inclusions vary between hospitals. Ask for the estimate in writing and check what is excluded.
                </p>
              </Section>

              <Section eyebrow="Paying for treatment" title="Insurance & EMI">
                <InsuranceEmiBlock />
              </Section>

              <Section eyebrow="In your city" title={`${t.name} cost by city`}>
                <p className="mb-3 text-sm text-muted-foreground">
                  Prices differ between cities. See the surgeons and hospitals we list in yours:
                </p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <a key={c.slug} href={`/specialities/${spec.slug}/${c.slug}`} className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary/40">
                      {spec.name} in {c.name}
                    </a>
                  ))}
                </div>
              </Section>

              <Section eyebrow="FAQs" title={`${t.name} cost — frequently asked questions`}>
                <FaqList faqs={costFaqs(t.name)} />
              </Section>

              {related.length ? (
                <Section eyebrow="Related" title={`Other ${spec.name} procedures`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {related.map((r) => (
                      <a key={r.slug} href={`/cost/${r.slug}`} className="group flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-cream px-4 py-3">
                        <span className="truncate text-sm font-semibold text-navy">{r.name} cost</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange" />
                      </a>
                    ))}
                  </div>
                </Section>
              ) : null}

              <MedicalDisclaimer />
            </div>

            <aside id="book" className="scroll-mt-40 lg:sticky lg:top-36 lg:self-start">
              <ConsultForm defaultInterest={`t:${t.slug}`} title={<>Ask for a cost <span className="text-primary">estimate</span></>} />
              <p className="mt-2 text-center text-xs text-muted-foreground">{BOOK_LABEL} — no obligation.</p>
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
