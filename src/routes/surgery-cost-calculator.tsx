import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, SectionHead } from "@/components/home/primitives";
import { Breadcrumbs, FaqList, MedicalDisclaimer, Section } from "@/components/care/Blocks";
import { CostEstimator } from "@/components/tools/CostEstimator";
import { TREATMENTS } from "@/data/catalog";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";
import { BOOK_LABEL } from "@/lib/site";

const FAQS = [
  {
    q: "How does this calculator work?",
    a: "You pick a procedure and, if you like, your city. It shows the cost range we hold for that procedure — it does not calculate anything from your personal details.",
  },
  {
    q: "Why does it say no price is published for my procedure?",
    a: "Because we only show figures we can stand behind, and we don't have a checked range for it yet. Ask us for an estimate and our team will help you get a written one from the hospital.",
  },
  {
    q: "Is the range what I will pay?",
    a: "No. It is a guide. The hospital and city you choose, your room category, the technique your surgeon uses, implants, how long you stay and what your insurance covers all change the final bill.",
  },
  {
    q: "Does insurance cover it?",
    a: "Many planned procedures are covered when medically necessary, subject to your policy's waiting periods and limits. Cashless treatment also needs the hospital to be in your insurer's network — share your policy and our team will check.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Where a hospital or lender offers EMI, you can work out the monthly figure with our EMI calculator. Eligibility and rates are set by the lender.",
  },
];

export const Route = createFileRoute("/surgery-cost-calculator")({
  head: () =>
    seo({
      title: "Surgery Cost Calculator",
      description: `Pick from ${TREATMENTS.length} procedures and your city to see the cost range we hold, what drives the final bill, and how to get a written estimate from the hospital.`,
      path: "/surgery-cost-calculator",
      jsonLd: [
        faqLd(FAQS),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Surgery cost", path: "/cost" },
          { name: "Cost calculator", path: "/surgery-cost-calculator" },
        ]),
      ],
    }),
  component: CostCalculatorPage,
});

function CostCalculatorPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs
          items={[{ name: "Home", href: "/" }, { name: "Surgery cost", href: "/cost" }, { name: "Cost calculator" }]}
        />

        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Cost guide</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Surgery cost calculator</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/80 sm:text-base">
              Choose your procedure and city to see the cost range we hold for it, and what the final
              bill depends on.
            </p>
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <CostEstimator />
          </Container>
        </section>

        <section className="bg-cream py-12">
          <Container className="max-w-3xl">
            <Section eyebrow="Reading the range" title="What changes the number">
              <ul className="space-y-2 text-sm text-ink/85 sm:text-base">
                {[
                  "The hospital and city — a metro corporate hospital costs more than a smaller nursing home.",
                  "Room category: general ward, shared or private.",
                  "The technique your surgeon recommends, and any implants or meshes used.",
                  "How long you stay, and whether you need ICU care.",
                  "What your insurance covers, and whether the hospital is in its network.",
                ].map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </Section>
            <div className="mt-8">
              <SectionHead eyebrow="FAQs" title="About this calculator" />
              <FaqList faqs={FAQS} />
            </div>
            <div className="mt-8">
              <MedicalDisclaimer />
            </div>
          </Container>
        </section>

        <section className="bg-navy py-12 text-center text-navy-foreground">
          <Container>
            <h2 className="text-2xl font-bold sm:text-3xl">Want a number for your own case?</h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              Tell us your procedure and city and we'll help you get a written estimate from the hospital.
            </p>
            <a href="/contact" className="mt-6 inline-block">
              <OrangeButton>{BOOK_LABEL}</OrangeButton>
            </a>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
