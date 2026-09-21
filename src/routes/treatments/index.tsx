import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";
import { Breadcrumbs } from "@/components/care/Blocks";
import { SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { breadcrumbLd, seo } from "@/lib/seo";
import { A } from "@/components/common/A";

import { useSpecName, useT } from "@/lib/i18n/context";
import { WithLink } from "@/lib/i18n/rich";
export const Route = createFileRoute("/treatments/")({
  head: ({ match }) =>
    seo({ locale: match.context.locale,
      title: `All ${TREATMENTS.length} Surgical Treatments & Procedures`,
      description: `Browse ${TREATMENTS.length} surgical treatments across ${SPECIALITIES.length} specialities — what each procedure involves, hospital stay, recovery and insurance cover.`,
      path: "/treatments",
      jsonLd: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Treatments", path: "/treatments" }])],
    }),
  component: TreatmentsIndex,
});

function TreatmentsIndex() {
  const t = useT();
  const specName = useSpecName();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const groups = useMemo(
    () =>
      SPECIALITIES.map((s) => ({
        spec: s,
        items: TREATMENTS.filter(
          (t) => t.speciality === s.slug && (!term || `${t.name} ${(t.aka ?? []).join(" ")}`.toLowerCase().includes(term)),
        ),
      })).filter((g) => g.items.length),
    [term],
  );
  const shown = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("nav.treatments") }]} />
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{t("nav.treatments")}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">{t("idx.treatTitle", { n: TREATMENTS.length })}</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">
              {t("idx.treatIntro")}
            </p>
            <label className="mt-6 flex max-w-xl items-center gap-2 rounded-lg bg-background px-3 py-2.5">
              <Search className="h-4 w-4 text-brand-orange" />
              <span className="sr-only">{t("idx.treatSearchLabel")}</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("idx.treatSearchPh")} className="w-full bg-transparent text-sm outline-none" />
            </label>
          </Container>
        </section>

        <nav aria-label={t("idx.jump")} className="sticky top-[73px] z-30 border-b border-border bg-background/95 backdrop-blur">
          <Container className="no-scrollbar flex gap-4 overflow-x-auto py-2.5 text-xs font-semibold">
            {groups.map((g) => (
              <A key={g.spec.slug} href={`#${g.spec.slug}`} className="shrink-0 text-muted-foreground hover:text-navy">{specName(g.spec.slug, g.spec.name)}</A>
            ))}
          </Container>
        </nav>

        <section className="py-10">
          <Container className="space-y-10">
            {term ? <p className="text-sm text-muted-foreground">{t("idx.treatMatch", { n: shown, q })}</p> : null}
            {groups.map((g) => (
              <section key={g.spec.slug} id={g.spec.slug} className="scroll-mt-40">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 className="text-xl font-bold text-navy">{specName(g.spec.slug, g.spec.name)}</h2>
                  <A href={`/specialities/${g.spec.slug}`} className="text-xs font-semibold text-primary hover:underline">{t("idx.aboutSpec", { spec: specName(g.spec.slug, g.spec.name) })}</A>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((tr) => (
                    <A key={tr.slug} href={`/treatments/${tr.slug}`} className="group rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md">
                      <h3 className="flex items-center justify-between gap-2 text-sm font-bold text-navy group-hover:text-primary">
                        {tr.name} <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange" />
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tr.summary}</p>
                      <p className="mt-2 text-[11px] font-semibold text-primary">{t("sp.stay", { stay: tr.stay })}</p>
                    </A>
                  ))}
                </div>
              </section>
            ))}
            {shown === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                <WithLink text={t("idx.treatNone", { q })} link={<A href="/contact" className="font-semibold text-primary underline">{t("idx.askTeamCap")}</A>} />
              </p>
            ) : null}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
