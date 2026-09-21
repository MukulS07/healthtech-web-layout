import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, ShieldCheck, FileText, Clock, ChevronDown } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { BOOK_LABEL } from "@/lib/site";

const benefits = [
  {
    icon: Wallet,
    title: "No lump-sum payment",
    desc: "Spread your treatment cost over monthly instalments instead of paying the full amount upfront.",
  },
  {
    icon: ShieldCheck,
    title: "Zero processing markup",
    desc: "\"No-cost\" means the interest component is offset, so you don't pay more than the treatment's actual cost across your instalments.",
  },
  {
    icon: FileText,
    title: "Simple paperwork",
    desc: "Your Care Partner helps you complete the EMI application alongside your booking — no separate loan office visit.",
  },
  {
    icon: Clock,
    title: "Flexible tenure",
    desc: "Choose a repayment period that fits your budget, confirmed with you before you commit to anything.",
  },
];

const eligibility = [
  "A credit card issued by a participating bank, or eligibility for a no-cost EMI plan through a partner NBFC",
  "Treatment cost within the minimum amount required for EMI conversion (confirmed by your Care Partner for your specific procedure)",
  "Valid government-issued photo ID for verification",
];

const faqs = [
  {
    q: "Who is eligible for no-cost EMI?",
    a: "Eligibility depends on your bank or the financing partner's own credit checks — your Care Partner will confirm what tenure and terms you qualify for once your treatment is finalised.",
  },
  {
    q: "Are there any hidden charges?",
    a: "No. Every cost is confirmed with you in writing before you commit to anything, matching Go Surgery's standard transparent-pricing policy.",
  },
  {
    q: "What tenure options are usually available?",
    a: "Partner banks and NBFCs typically offer instalment periods ranging from a few months to about a year — your Care Partner will confirm what's available for your card or lender.",
  },
  {
    q: "What documents do I need?",
    a: "A valid photo ID and your card/lender details. Your Care Partner will guide you through the exact paperwork at the time of booking.",
  },
  {
    q: "Can I use this alongside insurance?",
    a: "Yes — EMI can be used to cover any portion of the cost not covered by insurance, such as a co-pay or non-covered items.",
  },
  {
    q: "What if I have an issue with my EMI plan after booking?",
    a: "Contact your Care Partner or reach out through Patient Help and the team will help resolve it directly with the financing partner.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-background">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-navy">{f.q}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-brand-orange transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/no-cost-emi")({
  head: () => ({
    meta: [
      { title: "No-Cost EMI | Go Surgery" },
      {
        name: "description",
        content:
          "Pay for your treatment in monthly instalments through Go Surgery's no-cost EMI options.",
      },
    ],
  }),
  component: NoCostEmiPage,
});

function NoCostEmiPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Payment options</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              No-Cost EMI
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Where a hospital or lender offers it, you can spread your treatment cost over
              monthly instalments. Work out what those instalments would be before you commit.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/emi-calculator"><OrangeButton>Calculate my EMI</OrangeButton></a>
              <a href="/contact"><OutlineButton tone="light">Ask about payment options</OutlineButton></a>
            </div>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead eyebrow="Why patients use it" title="How no-cost EMI helps" />
            <div className="grid gap-5 sm:grid-cols-2">
              {benefits.map((b) => (
                <div key={b.title} className="rounded-xl border border-border bg-background p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-navy">
                    <b.icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-navy">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Eligibility" title="What you'll need" />
            <ul className="space-y-0">
              {eligibility.map((e) => (
                <li key={e} className="border-t border-border py-3.5 text-sm text-ink/80 last:border-b">
                  {e}
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Good to know" title="Frequently asked questions" />
            <FaqAccordion />
          </Container>
        </section>

        <section className="bg-navy py-14 text-center text-navy-foreground">
          <Container>
            <Eyebrow tone="light">Ready to check your options?</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Talk to a Care Partner about EMI
            </h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              We'll confirm your exact eligibility and tenure once your treatment is finalised.
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
