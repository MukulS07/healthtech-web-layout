import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, IndianRupee } from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton } from "@/components/home/primitives";
import { Breadcrumbs, FaqList, MedicalDisclaimer } from "@/components/care/Blocks";
import { SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { costIndex } from "@/data/cost";
import { seo } from "@/lib/seo";
import { BOOK_LABEL, COSTS_PUBLISHED } from "@/lib/site";

const POPULAR = [
  "laser-piles-surgery",
  "laparoscopic-cholecystectomy",
  "laparoscopic-hernia-repair",
  "phaco-cataract-surgery",
  "total-knee-replacement",
  "rirs",
  "circumcision",
  "fess",
  "lasik",
  "laser-fistula-surgery",
  "evla",
  "gynecomastia-surgery",
];

const costFactors = [
  "Which hospital and city you choose",
  "Room category (general ward, shared, or private)",
  "Your surgeon's experience and the technique used (open vs. minimally invasive)",
  "Whether your insurance covers the procedure, and how much",
  "Any pre-existing conditions that affect anaesthesia or hospital stay length",
];

const INDEX_FAQS = [
  {
    q: "Why don't you publish a price list?",
    a: "Because the number would not be yours. The same operation costs different amounts at different hospitals, in different cities, in different room categories — and your insurance may cover much of it. We help you get a written estimate from the hospital you choose instead.",
  },
  {
    q: "How do I find out what my surgery will cost?",
    a: "Open the cost page for your procedure and send us your details. Our team will help you request a written estimate from suitable hospitals and check what your policy covers.",
  },
  {
    q: "Does insurance cover surgery?",
    a: "Many planned procedures are covered when medically necessary, subject to your policy's waiting periods and limits. Cashless treatment also needs the hospital to be in your insurer's network.",
  },
];

export const Route = createFileRoute("/cost")({
  head: () =>
    seo({
      title: "Surgery Cost Guide",
      description:
        "What affects the cost of surgery in India — hospital, city, room category, technique and insurance — with a cost page for every procedure we cover.",
      path: "/cost",
    }),
  component: CostIndexPage,
});

function CostIndexPage() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const groups = useMemo(() => {
    const all = costIndex();
    if (!term) return all;
    return all
      .map((g) => ({
        ...g,
        treatments: g.treatments.filter((t) =>
          `${t.name} ${(t.aka ?? []).join(" ")} ${g.speciality.name}`.toLowerCase().includes(term),
        ),
      }))
      .filter((g) => g.treatments.length > 0);
  }, [term]);

  const popular = POPULAR.map((slug) => TREATMENTS.find((t) => t.slug === slug)!).filter(Boolean);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Surgery cost" }]} />

        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Cost guide</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              What does your surgery cost?
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Costs depend on the hospital, your city, the room category and the technique used. Find
              your procedure below to see what drives its price — and ask us to help you get a written
              estimate for your own case.
            </p>
            <a href="/contact" className="mt-6 inline-block">
              <OrangeButton>Ask for an estimate</OrangeButton>
            </a>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <SectionHead eyebrow="Popular procedures" title="Most-asked-about costs" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((t) => (
                <a
                  key={t.slug}
                  href={`/cost/${t.slug}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-navy/30"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-navy">{t.name} cost</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {SPECIALITIES.find((s) => s.slug === t.speciality)?.name}
                    </span>
                  </span>
                  <IndianRupee className="h-4 w-4 shrink-0 text-brand-orange" />
                </a>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream py-12">
          <Container>
            <SectionHead eyebrow="All procedures" title={`Cost pages for ${TREATMENTS.length} procedures`} />
            <label className="mx-auto mb-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
              <IndianRupee className="h-4 w-4 shrink-0 text-brand-orange" />
              <span className="sr-only">Search procedures</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a procedure — e.g. piles, hernia, cataract"
                className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
              />
            </label>

            {groups.length ? (
              <div className="space-y-8">
                {groups.map(({ speciality, treatments }) => (
                  <div key={speciality.slug}>
                    <h2 className="text-base font-bold text-navy">
                      <a href={`/specialities/${speciality.slug}`} className="hover:underline">{speciality.name}</a>
                    </h2>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {treatments.map((t) => (
                        <a
                          key={t.slug}
                          href={`/cost/${t.slug}`}
                          className="group flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3"
                        >
                          <span className="truncate text-sm font-medium text-navy">{t.name}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange transition-transform group-hover:translate-x-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-border bg-background p-6 text-center text-sm text-muted-foreground">
                No procedure matches “{q}”. Try a different word, or{" "}
                <a href="/contact" className="font-semibold text-primary hover:underline">ask our team</a>.
              </p>
            )}
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Why cost varies" title="What affects your final price" />
            <ul className="space-y-0">
              {costFactors.map((f) => (
                <li key={f} className="border-t border-border py-3.5 text-sm text-ink/80 last:border-b">
                  {f}
                </li>
              ))}
            </ul>
            {!COSTS_PUBLISHED ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Because of this, we don't publish price ranges we can't stand behind. Tell us your
                procedure and city and we'll help you get a written estimate from the hospital.
              </p>
            ) : null}
            <div className="mt-8">
              <FaqList faqs={INDEX_FAQS} />
            </div>
            <div className="mt-8">
              <MedicalDisclaimer />
            </div>
          </Container>
        </section>

        <section className="bg-navy py-14 text-center text-navy-foreground">
          <Container>
            <Eyebrow tone="light">Want a number for your case?</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Ask about costs for your case</h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              Tell us your treatment and city — no obligation to book.
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
