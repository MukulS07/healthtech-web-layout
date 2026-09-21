import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { SITE, promiseEnabled, telHref, whatsappHref } from "@/lib/site";
import { A } from "@/components/common/A";
import { seo } from "@/lib/seo";

type Faq = { q: string; a: string };

/*
 * Answers only describe what the service verifiably does today. Operational promises (free
 * consultation, free cab, turnaround times, "no hidden costs", accreditation of every hospital)
 * were removed — they need the business to confirm them first. See SERVICE_PROMISES in
 * src/lib/site.ts; the "free consultation" answer switches on automatically with that flag.
 */
const faqCategories: { label: string; faqs: Faq[] }[] = [
  {
    label: "General",
    faqs: [
      ...(promiseEnabled("free-consult")
        ? [
            {
              q: "Is the first consultation free?",
              a: "Yes. Your first consultation with a specialist is free. Our team will explain what any further tests or treatment would cost before anything is booked.",
            },
          ]
        : []),
      {
        q: "How quickly can I get an appointment?",
        a: "It depends on the specialist and your city. When our team calls you back, they'll tell you the earliest available slots with suitable surgeons.",
      },
      {
        q: "Do I need a referral from a GP?",
        a: "No. You can request a consultation directly. Please bring any existing reports or prescriptions to the appointment.",
      },
      {
        q: "What cities do you operate in?",
        a: "We help patients across major Indian cities including Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur, Lucknow, Kochi and Indore. See the Locations page for surgeons and hospitals listed in each city.",
      },
      {
        q: "Can I choose my surgeon?",
        a: "Yes. You can browse surgeon profiles in our directory and ask for a specific doctor, or ask our team to suggest specialists suited to your condition.",
      },
    ],
  },
  {
    label: "Insurance & Payment",
    faqs: [
      {
        q: "Which insurers do you support?",
        a: "Cashless treatment depends on your insurer and whether the hospital you choose is in its network. Share your policy details through the insurance eligibility form and our team will check it for you.",
      },
      {
        q: "How long does insurance pre-authorisation take?",
        a: "It varies by insurer and hospital. Pre-authorisation is decided by your insurer (or its TPA), not by us — the hospital's insurance desk submits the request and the insurer responds.",
      },
      {
        q: "What if my insurance doesn't cover the procedure?",
        a: "Ask our team about payment options. Where EMI plans are available through lenders, eligibility and terms are set by the lender.",
      },
      {
        q: "How will I know what the treatment costs?",
        a: "Costs depend on the procedure, the hospital, room category and your medical needs. Ask the hospital for a written estimate before admission, and check what your insurance covers.",
      },
      {
        q: "Can I claim reimbursement if I pay upfront?",
        a: "Usually, yes, if your policy covers the treatment. Keep your discharge summary, bills, prescriptions and reports — insurers need the originals for a reimbursement claim.",
      },
    ],
  },
  {
    label: "Surgery & Recovery",
    faqs: [
      {
        q: "Are the procedures minimally invasive?",
        a: "Many common procedures can be done laparoscopically, endoscopically or with laser techniques, which usually means smaller cuts and quicker recovery. Whether that's suitable for you is your surgeon's decision after examining you.",
      },
      {
        q: "How long does recovery take?",
        a: "It depends on the procedure. Many minimally invasive procedures allow discharge within a day or two; joint replacements and major surgery take longer. Each treatment page lists typical ranges, and your surgeon will tell you what applies to you.",
      },
      {
        q: "What post-surgery support is available?",
        a: "Your surgeon and hospital are responsible for your post-operative care and follow-up. Our team can help you book your follow-up review. For emergencies, always call 112 or go to the nearest emergency department.",
      },
      {
        q: "What if there is a complication after surgery?",
        a: "Contact your surgeon or the hospital straight away, and for anything urgent call 112 or go to the nearest emergency department. Every surgery carries some risk — your surgeon will explain the specific risks before you consent.",
      },
    ],
  },
  {
    label: "Hospitals & Safety",
    faqs: [
      {
        q: "Are the hospitals accredited?",
        a: "Accreditation varies by hospital. Our hospital directory lists hospitals from records we hold — it isn't a partner network, and we don't yet show accreditation status. Ask the hospital directly (for example about NABH accreditation) before you decide.",
      },
      {
        q: "How are surgeons listed?",
        a: "Our directory is built from doctor records we hold, filtered to surgical specialities. Profiles aren't individually verified yet — check a doctor's registration on the National Medical Commission's Indian Medical Register before treatment.",
      },
      {
        q: "Can I visit the hospital before surgery?",
        a: "Usually, yes. Ask the hospital when you book — most are happy for patients and families to see the facilities beforehand.",
      },
    ],
  },
];

export const Route = createFileRoute("/faqs")({
  head: ({ match }) =>
    seo({
      locale: match.context.locale,
      title: "Frequently Asked Questions",
      description: "Answers to your most common questions about surgery, insurance, recovery and Go Surgery's services.",
      path: "/faqs",
    }),
  component: FaqsPage,
});

function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-cream">
          <button
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

function FaqsPage() {
  const [activeCategory, setActiveCategory] = useState("General");

  const activeFaqs = faqCategories.find((c) => c.label === activeCategory)?.faqs ?? [];

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Good to know</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Answers to the most common questions about our services, insurance, surgery and
              recovery.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="min-w-0">
              {/* Category tabs */}
              <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
                {faqCategories.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setActiveCategory(c.label)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      activeCategory === c.label
                        ? "bg-navy text-navy-foreground"
                        : "bg-cream text-ink/70 hover:text-navy"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <SectionHead title={activeCategory} eyebrow={`${activeFaqs.length} questions`} />
              <FaqAccordion faqs={activeFaqs} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <ConsultForm />
              <div className="rounded-xl bg-cream p-5">
                <p className="text-sm font-bold text-navy">Can't find your answer?</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Talk to our care team directly. We're available 7 days a week.
                </p>
                <A href={telHref}><OrangeButton className="mt-4 w-full">Call {SITE.phone.display}</OrangeButton></A>
              </div>
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
