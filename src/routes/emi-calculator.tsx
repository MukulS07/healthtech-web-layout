import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton, SectionHead } from "@/components/home/primitives";
import { Breadcrumbs, FaqList, MedicalDisclaimer, Section } from "@/components/care/Blocks";
import { EmiCalculator } from "@/components/tools/EmiCalculator";
import { breadcrumbLd, faqLd, seo } from "@/lib/seo";
import { BOOK_LABEL } from "@/lib/site";
import { A } from "@/components/common/A";

const FAQS = [
  {
    q: "How is the EMI worked out?",
    a: "With the standard reducing-balance formula lenders use: the instalment is calculated from the amount financed, the annual interest rate divided over twelve months, and the number of months. At 0% it is simply the amount divided by the number of months.",
  },
  {
    q: "Is “no-cost EMI” really free?",
    a: "Not always. Some lenders charge a processing fee, and some sellers take the interest off as a discount and add it back to the price. Ask for the total amount you will repay, in writing, before you sign.",
  },
  {
    q: "Does this tell me what my surgery costs?",
    a: "No. It only does the arithmetic on an amount you type in. For the cost itself, ask the hospital for a written estimate — our team can help you request one and check what your insurance covers.",
  },
  {
    q: "Can I get an EMI plan through Go Surgery?",
    a: "Where a hospital or lender offers one, we can point you to it. Eligibility, the interest rate and approval are decided by the lender after their own credit check, not by us.",
  },
  {
    q: "Should I use insurance or EMI?",
    a: "Check insurance first — if your policy covers the procedure and the hospital is in its network, cashless treatment usually costs you far less than borrowing. EMI is for what insurance doesn't cover.",
  },
];

export const Route = createFileRoute("/emi-calculator")({
  head: ({ match }) =>
    seo({ locale: match.context.locale,
      title: "EMI Calculator for Surgery Costs",
      description:
        "Work out the monthly instalment on a treatment amount: enter the amount, repayment period and interest rate to see your EMI, the interest payable and the total you repay.",
      path: "/emi-calculator",
      jsonLd: [
        faqLd(FAQS),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "EMI calculator", path: "/emi-calculator" },
        ]),
      ],
    }),
  component: EmiCalculatorPage,
});

function EmiCalculatorPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "EMI calculator" }]} />

        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Paying for treatment</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">EMI calculator</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/80 sm:text-base">
              If you plan to pay for treatment in instalments, work out what the monthly payment
              would be before you commit. Enter the amount, how long you want to repay over, and the
              rate a lender has quoted you.
            </p>
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <EmiCalculator />
            <p className="mt-3 text-xs text-muted-foreground">
              These figures come only from what you type in. We don't know your treatment cost or
              what any lender will offer you — ask the hospital for a written estimate and the lender
              for their rate, processing fee and total repayable.
            </p>
          </Container>
        </section>

        <section className="bg-cream py-12">
          <Container className="max-w-3xl">
            <Section eyebrow="Before you borrow" title="Worth checking first">
              <ul className="space-y-2 text-sm text-ink/85 sm:text-base">
                {[
                  "Whether your health insurance covers the procedure — that usually beats borrowing.",
                  "The hospital's written estimate, and what it excludes (implants, extra days, tests).",
                  "The lender's processing fee, and any charge for paying off the loan early.",
                  "The total you will repay, not just the monthly figure.",
                ].map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </Section>
            <div className="mt-8">
              <SectionHead eyebrow="FAQs" title="Questions about EMI" />
              <FaqList faqs={FAQS} />
            </div>
            <div className="mt-8">
              <MedicalDisclaimer />
            </div>
          </Container>
        </section>

        <section className="bg-navy py-12 text-center text-navy-foreground">
          <Container>
            <h2 className="text-2xl font-bold sm:text-3xl">Need the cost before the instalment?</h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              Tell us your procedure and city and we'll help you get a written estimate.
            </p>
            <A href="/contact" className="mt-6 inline-block">
              <OrangeButton>{BOOK_LABEL}</OrangeButton>
            </A>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
