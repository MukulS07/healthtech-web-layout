import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Clock3, FileCheck2, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton } from "@/components/home/primitives";
import { submitInsuranceCheckFn } from "@/lib/server-functions/insurance";

const insurers = [
  "Star Health",
  "HDFC Ergo",
  "Care Health",
  "Bajaj Allianz",
  "ICICI Lombard",
  "TATA AIG",
  "Aditya Birla Health",
  "New India Assurance",
];

const howItWorks = [
  {
    icon: FileCheck2,
    title: "Share your policy details",
    desc: "Tell us your insurer, city, and condition — no documents to upload upfront.",
  },
  {
    icon: ShieldCheck,
    title: "We check your coverage",
    desc: "Our insurance desk verifies cashless eligibility directly with your insurer.",
  },
  {
    icon: Clock3,
    title: "Get a call within 30 minutes",
    desc: "We confirm what's covered, what isn't, and any co-pay — in writing, before you commit.",
  },
];

const faqs = [
  {
    q: "Is this check free?",
    a: "Yes, checking your cashless eligibility is completely free and comes with no obligation to book.",
  },
  {
    q: "What if my insurer isn't listed?",
    a: "List it anyway using \"Something else\" in the form — our desk works with most major insurers, not just the ones shown here.",
  },
  {
    q: "What if I'm not eligible for cashless treatment?",
    a: "You can still get reimbursement claim support after treatment, or use No-Cost EMI to spread the cost instead.",
  },
  {
    q: "Do I need my policy number right now?",
    a: "No — it speeds things up if you have it, but our desk can look up your policy with just your name and insurer.",
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

function EligibilityForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState("");
  const [insurer, setInsurer] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !city || !condition || !insurer) {
      toast.error("Please fill in your name, phone, city, condition, and insurer.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitInsuranceCheckFn({
        data: { name, phone, city, condition, insurer, policyNumber: policyNumber || undefined },
      });
      if (res.success) {
        toast.success(res.message);
        setName("");
        setPhone("");
        setCity("");
        setCondition("");
        setInsurer("");
        setPolicyNumber("");
      } else {
        toast.error(res.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Full Name *</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Phone *</label>
          <input
            className={inputClass}
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">City *</label>
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Condition / Surgery *</label>
          <input
            className={inputClass}
            placeholder="e.g. Piles, Hernia, Cataract"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Insurer *</label>
          <select
            className={inputClass}
            value={insurer}
            onChange={(e) => setInsurer(e.target.value)}
            required
          >
            <option value="">Select your insurer</option>
            {insurers.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
            <option value="Something else">Something else</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">
            Policy Number <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            className={inputClass}
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
          />
        </div>
      </div>
      <OrangeButton type="submit" disabled={isSubmitting} className="w-full py-3 text-base sm:w-auto">
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking...
          </span>
        ) : (
          "Check My Eligibility"
        )}
      </OrangeButton>
    </form>
  );
}

export const Route = createFileRoute("/insurance-eligibility")({
  head: () => ({
    meta: [
      { title: "Check Insurance Eligibility | Go Surgery" },
      {
        name: "description",
        content:
          "Find out if your health insurance covers cashless treatment at Go Surgery — free, no obligation.",
      },
    ],
  }),
  component: InsuranceEligibilityPage,
});

function InsuranceEligibilityPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Insurance support</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Check Your Insurance Eligibility
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Find out what your policy covers before you commit to anything — free, and usually
              confirmed within 30 minutes.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionHead eyebrow="Get started" title="Submit your policy details" />
              <EligibilityForm />
            </div>
            <div>
              <div className="rounded-xl bg-cream p-6">
                <SectionHead eyebrow="How it works" title="What happens next" />
                <div className="space-y-5">
                  {howItWorks.map((s, i) => (
                    <div key={s.title} className="flex gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy">{s.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-border bg-background p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-navy/70">
                  Insurers we work with
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insurers.map((i) => (
                    <span
                      key={i}
                      className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs font-semibold text-navy"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Good to know" title="Frequently asked questions" />
            <FaqAccordion />
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
