import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";
import { Breadcrumbs } from "@/components/care/Blocks";
import { CONDITIONS, SPECIALITIES } from "@/data/catalog";
import { breadcrumbLd, seo } from "@/lib/seo";
import { A } from "@/components/common/A";

import { useSpecName, useT } from "@/lib/i18n/context";
import { WithLink } from "@/lib/i18n/rich";
export const Route = createFileRoute("/conditions/")({
  head: ({ match }) =>
    seo({ locale: match.context.locale,
      title: `${CONDITIONS.length} Health Conditions — Symptoms & Treatment`,
      description: `Learn about ${CONDITIONS.length} common conditions treated with surgery — symptoms, causes, diagnosis, treatment options and when to see a doctor.`,
      path: "/conditions",
      jsonLd: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Conditions", path: "/conditions" }])],
    }),
  component: ConditionsIndex,
});

function ConditionsIndex() {
  const t = useT();
  const specName = useSpecName();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const groups = useMemo(
    () =>
      SPECIALITIES.map((s) => ({
        spec: s,
        items: CONDITIONS.filter(
          (c) => c.speciality === s.slug && (!term || `${c.name} ${(c.aka ?? []).join(" ")}`.toLowerCase().includes(term)),
        ),
      })).filter((g) => g.items.length),
    [term],
  );

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("nav.conditions") }]} />
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{t("nav.conditions")}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">{t("idx.condTitle")}</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">
              {t("idx.condIntro")}
            </p>
            <label className="mt-6 flex max-w-xl items-center gap-2 rounded-lg bg-background px-3 py-2.5">
              <Search className="h-4 w-4 text-brand-orange" />
              <span className="sr-only">{t("idx.condSearchLabel")}</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("idx.condSearchPh")}
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </Container>
        </section>
        <section className="py-10">
          <Container className="space-y-10">
            {groups.map((g) => (
              <section key={g.spec.slug}>
                <h2 className="mb-4 text-xl font-bold text-navy">{specName(g.spec.slug, g.spec.name)}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((c) => (
                    <A key={c.slug} href={`/conditions/${c.slug}`} className="group rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md">
                      <h3 className="flex items-center justify-between gap-2 text-sm font-bold text-navy group-hover:text-primary">
                        {c.name} <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange" />
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.summary}</p>
                    </A>
                  ))}
                </div>
              </section>
            ))}
            {groups.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">{t("idx.condNone", { q })}</p> : null}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
