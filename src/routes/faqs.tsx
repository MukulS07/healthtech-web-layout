import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";

type Faq = { q: string; a: string };

const faqCategories: { label: string; faqs: Faq[] }[] = [
  {
    label: "General",
    faqs: [
      { q: "Is the first consultation really free?", a: "Yes, absolutely. Your first consultation with a specialist — including diagnosis discussion, treatment options and a cost estimate — is completely free. No hidden charges." },
      { q: "How quickly can I get an appointment?", a: "In most cities we can arrange a consultation within 24–48 hours. In our key cities (Delhi NCR, Mumbai, Bangalore, Hyderabad) same-day appointments are often available." },
      { q: "Do I need a referral from a GP?", a: "No. You can directly book a consultation with any Prime Care specialist without a prior referral. We do recommend bringing any existing reports or prescriptions to the appointment." },
      { q: "What cities do you operate in?", a: "Prime Care operates in 45+ cities across India, including all major metros (Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Pune, Kolkata, Kochi) and Tier 2 cities." },
      { q: "Can I choose my surgeon?", a: "Yes. Once your condition is assessed, we'll suggest 2–3 specialists who are experienced with your specific situation. You can review their profiles and choose who you're most comfortable with." },
    ],
  },
  {
    label: "Insurance & Payment",
    faqs: [
      { q: "Which insurers do you support?", a: "We are cashless on 100+ insurance providers, including Star Health, HDFC Ergo, Care Health, Bajaj Allianz, ICICI Lombard, TATA AIG, Aditya Birla Health and New India Assurance." },
      { q: "How long does insurance pre-authorisation take?", a: "In most cases, we receive pre-authorisation within 30–60 minutes. We have a dedicated insurance desk that maintains active relationships with all major insurers." },
      { q: "What if my insurance doesn't cover the procedure?", a: "We offer flexible payment options including no-cost EMI through partner banks (typically 3–12 months). Our team will walk through all available options so you can plan effectively." },
      { q: "Are there any hidden costs?", a: "No. Before proceeding with surgery, you'll receive a detailed cost breakdown covering surgeon fees, hospital charges, anaesthesia, consumables and post-op medication. The number you see is the number you pay." },
      { q: "Can I claim reimbursement if I pay upfront?", a: "Yes. Our insurance team will provide all necessary documentation — discharge summary, bills, prescriptions — formatted to meet your insurer's reimbursement requirements." },
    ],
  },
  {
    label: "Surgery & Recovery",
    faqs: [
      { q: "Are the procedures minimally invasive?", a: "For the majority of our treatments, yes. We prioritise laparoscopic, laser and endoscopic approaches that reduce incision size, blood loss and recovery time compared to open surgery." },
      { q: "How long does recovery take?", a: "Most minimally invasive procedures allow discharge within 24 hours and return to desk work within 2–5 days. Complex procedures like knee or hip replacement have longer recovery timelines which your surgeon will explain in detail." },
      { q: "Do you provide free pick-up and drop on surgery day?", a: "Yes. Free comfortable vehicle pick-up and drop is arranged on the day of surgery and on discharge day for all eligible patients in serviceable cities." },
      { q: "What post-surgery support is available?", a: "Your care coordinator is available 24x7 and remains assigned to you until you are fully recovered. Free post-surgery follow-up consultations with your surgeon are included." },
      { q: "What if there is a complication after surgery?", a: "Complications are rare with our surgical team. If any concern arises, contact your care coordinator immediately — they will arrange emergency consultation and hospital support without delay." },
    ],
  },
  {
    label: "Hospitals & Safety",
    faqs: [
      { q: "Are your partner hospitals accredited?", a: "All Prime Care partner hospitals are NABH accredited and meet our internal safety standards, including modular OTs, post-op care units and zero-infection protocols." },
      { q: "How do you verify your surgeons?", a: "Every surgeon in our network is verified for qualifications, registration with the Medical Council of India, peer reputation and minimum procedural volume before listing." },
      { q: "Can I visit the hospital before surgery?", a: "Yes. We encourage pre-surgical facility visits. Your care coordinator will arrange a tour at a time convenient for you." },
    ],
  },
];

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | Prime Care" },
      { name: "description", content: "Answers to your most common questions about surgery, insurance, recovery and Prime Care's services." },
    ],
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
            <ChevronDown className={`h-5 w-5 shrink-0 text-brand-orange transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>}
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
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Frequently Asked Questions</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Answers to the most common questions about our services, insurance, surgery and recovery.
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
                      activeCategory === c.label ? "bg-navy text-navy-foreground" : "bg-cream text-ink/70 hover:text-navy"
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
                <p className="mt-2 text-sm text-muted-foreground">Talk to our care team directly. We're available 7 days a week.</p>
                <OrangeButton className="mt-4 w-full">Call 1800 000 1234</OrangeButton>
              </div>
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
