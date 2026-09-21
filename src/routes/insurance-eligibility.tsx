import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Clock3, FileCheck2, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton } from "@/components/home/primitives";
import { submitInsuranceCheckFn } from "@/lib/server-functions/insurance";
import { seo } from "@/lib/seo";
import { useLocale, useT } from "@/lib/i18n/context";
import { DEFAULT_WORDING } from "@/lib/site";

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
  { icon: FileCheck2, n: 1 },
  { icon: ShieldCheck, n: 2 },
  { icon: Clock3, n: 3 },
];

const faqs = [
  {
    q: "Is this check free?",
    a: "Yes, checking your cashless eligibility is completely free and comes with no obligation to book.",
  },
  {
    q: "What if my insurer isn't listed?",
    a: "List it anyway using \"Something else\" in the form — we can look at policies from insurers not shown here.",
  },
  {
    q: "What if I'm not eligible for cashless treatment?",
    a: "You may still be able to claim reimbursement after treatment, or ask us about EMI options to spread the cost.",
  },
  {
    q: "Do I need my policy number right now?",
    a: "No — it helps if you have it, but you can submit the form with just your name and insurer.",
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
  const t = useT();
  const locale = useLocale();
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
      toast.error(t("ins.fillAll"));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitInsuranceCheckFn({
        data: { name, phone, city, condition, insurer, policyNumber: policyNumber || undefined },
      });
      if (res.success) {
        toast.success(locale !== "en" && DEFAULT_WORDING ? t("ins.received") : res.message);
        setName("");
        setPhone("");
        setCity("");
        setCondition("");
        setInsurer("");
        setPolicyNumber("");
      } else {
        toast.error((locale === "en" && res.error) || t("home.genericError"));
      }
    } catch {
      toast.error(t("home.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("form.fullName")} *</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("form.phone")} *</label>
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
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("form.city")} *</label>
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("ins.conditionSurgery")} *</label>
          <input
            className={inputClass}
            placeholder={t("ins.conditionPh")}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("ins.insurer")} *</label>
          <select
            className={inputClass}
            value={insurer}
            onChange={(e) => setInsurer(e.target.value)}
            required
          >
            <option value="">{t("ins.selectInsurer")}</option>
            {insurers.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
            <option value="Something else">{t("form.somethingElse")}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">
            {t("ins.policyNumber")} <span className="font-normal text-muted-foreground">({t("form.optional")})</span>
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
            <Loader2 className="h-4 w-4 animate-spin" /> {t("ins.checking")}
          </span>
        ) : (
          t("ins.submit")
        )}
      </OrangeButton>
    </form>
  );
}

export const Route = createFileRoute("/insurance-eligibility")({
  head: ({ match }) =>
    seo({
      locale: match.context.locale,
      title: "Check Insurance Eligibility",
      description: "Find out if your health insurance covers cashless treatment at Go Surgery — free, no obligation.",
      path: "/insurance-eligibility",
    }),
  component: InsuranceEligibilityPage,
});

function InsuranceEligibilityPage() {
  const t = useT();
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">{t("ins.eyebrow")}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              {t("ins.title")}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              {t("ins.intro")}
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionHead eyebrow={t("ask.getStarted")} title={t("ins.submitTitle")} />
              <EligibilityForm />
            </div>
            <div>
              <div className="rounded-xl bg-cream p-6">
                <SectionHead eyebrow={t("home.howEyebrow")} title={t("ins.whatNext")} />
                <div className="space-y-5">
                  {howItWorks.map((s, i) => (
                    <div key={s.n} className="flex gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy">{t(`ins.step${s.n}Title`)}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{t(`ins.step${s.n}Desc`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-border bg-background p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-navy/70">
                  {t("ins.workWith")}
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
            <SectionHead eyebrow={t("home.faqEyebrow")} title={t("home.faqTitle")} />
            <FaqAccordion />
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
