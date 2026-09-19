import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { SITE, telHref, whatsappHref, ENABLED_PROMISES } from "@/lib/site";
import { seo } from "@/lib/seo";

const teamEmails = [
  { label: "Media & press", email: "press@gosurgery.in" },
  { label: "Partnerships", email: "partnerships@gosurgery.in" },
  { label: "Doctor onboarding", email: "doctors@gosurgery.in" },
  { label: "Careers", email: "careers@gosurgery.in" },
  { label: "Insurance & billing", email: "insurance@gosurgery.in" },
  { label: "Grievances", email: "grievance@gosurgery.in" },
];

const infoCards = [
  { icon: Phone, label: "Call us", value: SITE.phone.display, href: telHref, external: false },
  { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsapp.display, href: whatsappHref(), external: true },
  { icon: Mail, label: "Email us", value: SITE.email, href: `mailto:${SITE.email}`, external: false },
];

type ContactSearch = { doctor?: string | undefined; city?: string | undefined; interest?: string | undefined };

export const Route = createFileRoute("/contact")({
  validateSearch: (s: Record<string, unknown>): ContactSearch => ({
    doctor: typeof s["doctor"] === "string" ? (s["doctor"] as string).slice(0, 100) : undefined,
    city: typeof s["city"] === "string" ? (s["city"] as string).slice(0, 60) : undefined,
    interest: typeof s["interest"] === "string" ? (s["interest"] as string).slice(0, 80) : undefined,
  }),
  head: () =>
    seo({
      title: "Book a Free Consultation",
      description: `Book a free consultation with a surgeon — no account needed. Share your details and a Go Surgery care coordinator will call you back within ${SITE.callbackTime}.`,
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const search = Route.useSearch();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Free consultation</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Book Your Consultation</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Tell us what you need help with — no account required. A care coordinator will call you
              back within {SITE.callbackTime} to understand your concern and match you with the right
              specialist.
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
                title={search.doctor ? <>Consult <span className="text-primary">{search.doctor}</span></> : undefined}
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
                <Eyebrow>Other ways to reach us</Eyebrow>
                <h2 className="mt-2 text-xl font-bold text-navy">Contact Information</h2>
              </div>
              {infoCards.map((card) => (
                <a
                  key={card.label}
                  href={card.href}
                  {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex gap-4 rounded-xl border border-border bg-cream p-4 transition-colors hover:border-primary/40"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy">
                    <card.icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-navy">{card.value}</p>
                  </div>
                </a>
              ))}
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-ink/80">
                <p className="font-semibold text-navy">Medical emergency?</p>
                <p className="mt-1 text-xs">
                  Go Surgery is not an emergency service. For chest pain, severe bleeding, difficulty
                  breathing or other emergencies, call <strong>112</strong> or go to your nearest
                  emergency department.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-cream py-12">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Specific teams" title="Reach the right team directly" />
            <ul>
              {teamEmails.map((t) => (
                <li key={t.label} className="flex items-center justify-between gap-3 border-t border-border py-3.5 text-sm last:border-b">
                  <span className="font-semibold text-navy">{t.label}</span>
                  <a href={`mailto:${t.email}`} className="text-muted-foreground hover:text-brand-orange">
                    {t.email}
                  </a>
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
