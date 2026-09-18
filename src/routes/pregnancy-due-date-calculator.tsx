import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarHeart, ChevronDown } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton } from "@/components/home/primitives";

const cycleLengths = Array.from({ length: 22 }, (_, i) => 21 + i); // 21–42 days

const faqs = [
  {
    q: "How is my due date calculated?",
    a: "This tool uses Naegele's Rule: it takes the first day of your last menstrual period, adds 280 days (40 weeks), and adjusts for a cycle length other than the 28-day average. It's an estimate — most babies arrive within two weeks of this date, not on it exactly.",
  },
  {
    q: "Why does my cycle length matter?",
    a: "A longer or shorter cycle shifts when you likely ovulated, which shifts your estimated conception date and therefore your due date.",
  },
  {
    q: "Is this accurate for everyone?",
    a: "LMP-based estimates are less precise for irregular cycles. An early ultrasound (usually done in the first trimester) generally gives a more accurate estimate than LMP alone — bring your LMP date to your first consultation and your doctor can confirm or adjust it.",
  },
  {
    q: "What if I don't remember my last period date exactly?",
    a: "Use your best estimate. It's still a useful starting point, and your doctor can refine it with an ultrasound at your first visit.",
  },
  {
    q: "Does this tool store my information?",
    a: "No. The calculation happens entirely in your browser and nothing you enter here is saved or sent anywhere.",
  },
];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

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

export const Route = createFileRoute("/pregnancy-due-date-calculator")({
  head: () => ({
    meta: [
      { title: "Pregnancy Due Date Calculator | Go Surgery" },
      {
        name: "description",
        content:
          "Estimate your baby's due date from your last menstrual period and cycle length.",
      },
    ],
  }),
  component: PregnancyCalculatorPage,
});

function PregnancyCalculatorPage() {
  const [lmp, setLmp] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    if (!lmp) return null;
    const lmpDate = new Date(lmp);
    if (Number.isNaN(lmpDate.getTime())) return null;

    // Naegele's Rule, adjusted for a cycle length other than the 28-day average.
    const dueDate = addDays(lmpDate, 280 + (cycleLength - 28));
    const today = new Date();
    const gestationDays = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(gestationDays / 7);
    const days = gestationDays % 7;
    let trimester = "";
    if (gestationDays < 0) trimester = "Not yet begun";
    else if (weeks < 13) trimester = "First trimester";
    else if (weeks < 27) trimester = "Second trimester";
    else trimester = "Third trimester";

    return { dueDate, weeks, days, gestationDays, trimester };
  }, [lmp, cycleLength]);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Pregnancy tools</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Pregnancy Due Date Calculator
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Enter the first day of your last menstrual period to get an estimated due date.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <label className="mb-1.5 block text-xs font-semibold text-navy">
                First day of your last menstrual period
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                value={lmp}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  setLmp(e.target.value);
                  setCalculated(false);
                }}
              />
              <label className="mb-1.5 mt-4 block text-xs font-semibold text-navy">
                Average cycle length
              </label>
              <select
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                value={cycleLength}
                onChange={(e) => {
                  setCycleLength(Number(e.target.value));
                  setCalculated(false);
                }}
              >
                {cycleLengths.map((n) => (
                  <option key={n} value={n}>
                    {n} days
                  </option>
                ))}
              </select>
              <OrangeButton
                className="mt-5 w-full py-3 text-base"
                disabled={!lmp}
                onClick={() => setCalculated(true)}
              >
                Calculate Due Date
              </OrangeButton>
            </div>

            <div>
              {calculated && result ? (
                <div className="rounded-xl bg-cream p-6">
                  <CalendarHeart className="h-8 w-8 text-brand-orange" />
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-navy/70">
                    Estimated due date
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-navy sm:text-3xl">
                    {formatDate(result.dueDate)}
                  </p>
                  {result.gestationDays >= 0 && (
                    <p className="mt-3 text-sm text-ink/80">
                      You're approximately <strong>{result.weeks} weeks, {result.days} days</strong>{" "}
                      along — <strong>{result.trimester}</strong>.
                    </p>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">
                    This is an estimate, not a diagnosis. The actual delivery date may vary by a
                    few days or weeks — your doctor can confirm this with an ultrasound.
                  </p>
                  <a href="/contact" className="mt-5 inline-block">
                    <OrangeButton>Book a Consultation</OrangeButton>
                  </a>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Enter your last menstrual period date to see your estimated due date.
                </div>
              )}
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
