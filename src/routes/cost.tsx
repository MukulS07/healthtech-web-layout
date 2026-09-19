import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, IndianRupee } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton } from "@/components/home/primitives";
import { SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { seo } from "@/lib/seo";

const specialities = SPECIALITIES.map((s) => ({ label: s.name, slug: s.slug }));
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
const treatments = POPULAR.map((slug) => TREATMENTS.find((t) => t.slug === slug)!).filter(Boolean).map((t) => ({
  id: t.slug,
  slug: t.slug,
  name: t.name,
  category: SPECIALITIES.find((s) => s.slug === t.speciality)?.name ?? "",
}));

const costFactors = [
  "Which hospital and city you choose",
  "Room category (general ward, shared, or private)",
  "Your surgeon's experience and the technique used (open vs. minimally invasive)",
  "Whether your insurance covers the procedure, and how much",
  "Any pre-existing conditions that affect anaesthesia or hospital stay length",
];

export const Route = createFileRoute("/cost")({
  head: () =>
    seo({
      title: "Surgery Cost Guide",
      description: "Understand what affects the cost of surgery in India — hospital, city, room category, technique and insurance — and get a written quote for your case.",
      path: "/cost",
    }),
  component: CostIndexPage,
});

function CostIndexPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Cost guide</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              What does your surgery cost?
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Costs vary by hospital, city, and individual case — find your procedure below and a
              Care Partner will confirm an exact, written quote for you at no charge.
            </p>
            <a href="/contact" className="mt-6 inline-block">
              <OrangeButton>Get My Exact Quote</OrangeButton>
            </a>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead eyebrow="Browse by speciality" title="Find your procedure" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {specialities.map((s) => (
                <Link
                  key={s.slug}
                  to="/specialities/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-xl border border-border bg-background p-4 text-center text-sm font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-cream"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {treatments.length > 0 && (
          <section className="bg-cream py-14">
            <Container>
              <SectionHead eyebrow="Popular procedures" title="Explore treatment details" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {treatments.slice(0, 12).map((t) => (
                  <Link
                    key={t.id}
                    to="/treatments/$slug"
                    params={{ slug: t.slug }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-navy/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.category}</p>
                    </div>
                    <IndianRupee className="h-4 w-4 shrink-0 text-brand-orange" />
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link to="/treatments" className="inline-flex">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline">
                    <Search className="h-4 w-4" /> See all treatments
                  </span>
                </Link>
              </div>
            </Container>
          </section>
        )}

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
            <p className="mt-5 text-sm text-muted-foreground">
              Because of this, we don't publish a fixed price list — every quote is confirmed in
              writing with you before you commit to a hospital or date, so you know what to expect
              before admission.
            </p>
          </Container>
        </section>

        <section className="bg-navy py-14 text-center text-navy-foreground">
          <Container>
            <Eyebrow tone="light">Want an exact number?</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Get a written quote for your case
            </h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              Free consultation — no obligation to book.
            </p>
            <a href="/contact" className="mt-6 inline-block">
              <OrangeButton>Book a Free Consultation</OrangeButton>
            </a>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
