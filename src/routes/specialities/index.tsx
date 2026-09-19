import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";
import { Breadcrumbs } from "@/components/care/Blocks";
import { SPECIALITIES, conditionsForSpeciality, treatmentsForSpeciality } from "@/data/catalog";
import { breadcrumbLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/specialities/")({
  head: () =>
    seo({
      title: `All ${SPECIALITIES.length} Surgical Specialities`,
      description: `Browse all ${SPECIALITIES.length} surgical specialities at Go Surgery — from proctology and laparoscopy to orthopaedics, urology, ENT and eye care. Find conditions, treatments and specialists.`,
      path: "/specialities",
      jsonLd: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Specialities", path: "/specialities" }])],
    }),
  component: SpecialitiesIndex,
});

function SpecialitiesIndex() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Specialities" }]} />
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Specialities</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">All {SPECIALITIES.length} Specialities</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">
              Choose a speciality to learn about the conditions it treats, the procedures involved, and
              specialists and hospitals near you.
            </p>
          </Container>
        </section>
        <section className="py-10">
          <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALITIES.map((s) => {
              const nC = conditionsForSpeciality(s.slug).length;
              const nT = treatmentsForSpeciality(s.slug).length;
              return (
                <a key={s.slug} href={`/specialities/${s.slug}`} className="group flex flex-col justify-between rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div>
                    <h2 className="flex items-center justify-between text-lg font-bold text-navy group-hover:text-primary">
                      {s.name} <ArrowRight className="h-4 w-4 text-brand-orange" />
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{s.tagline}</p>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-primary">
                    {nT} treatments{nC ? ` · ${nC} conditions` : ""}
                  </p>
                </a>
              );
            })}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
