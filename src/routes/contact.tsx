import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { CALLBACK_PHRASE, CALLER, cap, CONSULT_PHRASE, DEFAULT_WORDING, ENABLED_PROMISES, promiseEnabled, SITE, telHref, whatsappHref } from "@/lib/site";
import { seo } from "@/lib/seo";
import { A } from "@/components/common/A";
import { useT } from "@/lib/i18n/context";
import { Emph } from "@/lib/i18n/rich";

const teamEmails = [
  { key: "contact.teamPress", email: "press@gosurgery.in" },
  { key: "contact.teamPartner", email: "partnerships@gosurgery.in" },
  { key: "contact.teamDoctors", email: "doctors@gosurgery.in" },
  { key: "nav.careers", email: "careers@gosurgery.in" },
  { key: "contact.teamInsurance", email: "insurance@gosurgery.in" },
  { key: "contact.teamGrievance", email: "grievance@gosurgery.in" },
];

const infoCards = [
  { icon: Phone, key: "contact.callUs", value: SITE.phone.display, href: telHref, external: false },
  { icon: MessageCircle, key: "", value: SITE.whatsapp.display, href: whatsappHref(), external: true },
  { icon: Mail, key: "contact.emailUs", value: SITE.email, href: `mailto:${SITE.email}`, external: false },
];

type ContactSearch = { doctor?: string | undefined; city?: string | undefined; interest?: string | undefined };

export const Route = createFileRoute("/contact")({
  validateSearch: (s: Record<string, unknown>): ContactSearch => ({
    doctor: typeof s["doctor"] === "string" ? (s["doctor"] as string).slice(0, 100) : undefined,
    city: typeof s["city"] === "string" ? (s["city"] as string).slice(0, 60) : undefined,
    interest: typeof s["interest"] === "string" ? (s["interest"] as string).slice(0, 80) : undefined,
  }),
  head: ({ match }) =>
    seo({ locale: match.context.locale,
      title: promiseEnabled("free-consult") ? "Book a Free Consultation" : "Book a Consultation",
      description: `Book ${CONSULT_PHRASE} with a surgeon — no account needed. Share your details and ${CALLER} will call you back ${CALLBACK_PHRASE}.`,
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const search = Route.useSearch();
  const t = useT();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">{promiseEnabled("free-consult") ? "Free consultation" : t("contact.eyebrow")}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">{t("contact.title")}</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              {DEFAULT_WORDING
                ? t("contact.intro")
                : `Tell us what you need help with — no account required. ${cap(CALLER)} will call you back ${CALLBACK_PHRASE} to understand your concern and match you with the right specialist.`}
            </p>
          </Container>
        </section>

        <section className="py-12">
          <Container className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="min-w-0">
              <ConsultForm
                showDetails
                defaultInterest={search.interest}
                defaultCity={search.city}
                doctorName={search.doctor}
                title={search.doctor ? <Emph text={t("consult.titleDoctor", { doctor: search.doctor })} /> : undefined}
              />
              {ENABLED_PROMISES.length ? (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {ENABLED_PROMISES.map((p) => (
                    <li key={p.key} className="flex items-start gap-2.5 rounded-lg border border-border bg-cream p-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        <span className="block text-sm font-semibold text-navy">{p.title}</span>
                        <span className="text-xs text-muted-foreground">{p.sub}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <Eyebrow>{t("contact.otherWays")}</Eyebrow>
                <h2 className="mt-2 text-xl font-bold text-navy">{t("contact.info")}</h2>
              </div>
              {infoCards.map((card) => (
                <A
                  key={card.key || "whatsapp"}
                  href={card.href}
                  {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex gap-4 rounded-xl border border-border bg-cream p-4 transition-colors hover:border-primary/40"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy">
                    <card.icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.key ? t(card.key) : "WhatsApp"}</p>
                    <p className="mt-0.5 text-sm font-semibold text-navy">{card.value}</p>
                  </div>
                </A>
              ))}
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-ink/80">
                <p className="font-semibold text-navy">{t("contact.emergencyTitle")}</p>
                <p className="mt-1 text-xs">
                  <Emph text={t("contact.emergencyBody")} className="font-bold" />
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-cream py-12">
          <Container className="max-w-3xl">
            <SectionHead eyebrow={t("contact.teamsEyebrow")} title={t("contact.teamsTitle")} />
            <ul>
              {teamEmails.map((team) => (
                <li key={team.key} className="flex items-center justify-between gap-3 border-t border-border py-3.5 text-sm last:border-b">
                  <span className="font-semibold text-navy">{t(team.key)}</span>
                  <A href={`mailto:${team.email}`} className="text-muted-foreground hover:text-brand-orange">
                    {team.email}
                  </A>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
