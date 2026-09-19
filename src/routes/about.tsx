import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import heroDoctor from "@/assets/hero-doctor.png";
import { SPECIALITIES } from "@/data/catalog";
import { BOOK_LABEL, CALLBACK_PHRASE, CALLER, cap, CITIES, promiseEnabled, SITE } from "@/lib/site";
import { seo } from "@/lib/seo";

const values = [
  {
    title: "Patient first",
    desc: "Every recommendation starts with what's right for the patient — including when surgery isn't the answer.",
  },
  {
    title: "Honesty",
    desc: "We explain options, risks and likely costs in plain language before anything is booked, and we only publish claims we can back up.",
  },
  {
    title: "Clinical judgement",
    desc: "Treatment decisions belong to qualified surgeons and their patients. Our job is to make that conversation easier to get to.",
  },
  {
    title: "Whole-journey support",
    desc: "We help each patient from the first call through admission and booking their follow-up.",
  },
];

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: `About ${SITE.name}`,
      description: `${SITE.name} helps patients in India find experienced surgeons, understand their treatment options, and get support with insurance, admission and recovery.`,
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-16">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow tone="light">About us</Eyebrow>
              <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl lg:text-5xl">Making planned surgery less confusing</h1>
              <p className="mt-4 text-sm leading-relaxed text-navy-foreground/75 sm:text-base">
                {SITE.name} helps patients find the right surgeon, understand their options and get
                through the practical side of surgery — appointments, insurance, admission and
                recovery — with one team on their side.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/contact"><OrangeButton>{BOOK_LABEL}</OrangeButton></a>
                <a href="/doctors"><OutlineButton tone="light">Find a Surgeon</OutlineButton></a>
              </div>
            </div>
            <img src={heroDoctor} alt="Care team" loading="lazy" width={1000} height={900} className="w-full max-w-md justify-self-center object-contain" />
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead align="center" eyebrow="Our mission" title="Why we exist" />
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                For many people in India, planned surgery is a fragmented experience: finding a
                trustworthy specialist, working out whether a procedure is really needed, making sense
                of insurance, and managing recovery — each step handled by someone different, or by no
                one at all.
              </p>
              <p>
                {SITE.name} exists to join those steps up. Our team helps from the first
                conversation about symptoms through to booking the follow-up after surgery, and our guides
                explain conditions and treatments in plain language so patients can ask better
                questions.
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="grid gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>For patients</Eyebrow>
              <h2 className="mt-2 text-xl font-bold text-navy">Help at every step</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                We help you find a specialist suited to your condition, explain the procedure and
                likely costs before anything is booked, check your insurance, and stay in touch through
                admission, discharge and follow-up.
              </p>
            </div>
            <div>
              <Eyebrow>For doctors and hospitals</Eyebrow>
              <h2 className="mt-2 text-xl font-bold text-navy">Work with us</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                We connect well-informed patients with qualified surgeons and help with scheduling,
                insurance documentation and patient communication.{" "}
                <a href="/doctor-onboarding" className="font-semibold text-primary hover:underline">Partner with us</a>.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Step by step" title={`How the ${SITE.name} journey works`} />
            {[
              { title: promiseEnabled("free-consult") ? "Free first consultation" : "First consultation", desc: "A specialist reviews your symptoms or reports and explains whether surgery is needed, and what alternatives exist." },
              { title: "A clear estimate", desc: "Before you agree to anything, ask the hospital for an estimate — we help you understand it and what your insurance may cover." },
              { title: "Insurance and scheduling", desc: "We help you check cashless eligibility and book the hospital slot and surgeon." },
              { title: "Surgery and discharge", desc: "We explain the admission and discharge steps so your family isn't left to figure it out." },
              { title: "Recovery follow-up", desc: "Check-in calls and a route back to your surgeon if anything feels wrong during recovery." },
            ].map((step, i, arr) => (
              <div key={step.title} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">{i + 1}</div>
                  {i < arr.length - 1 ? <div className="mt-1 w-px flex-1 bg-border" /> : null}
                </div>
                <div className="pb-8">
                  <h3 className="text-base font-bold text-navy">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container>
            <SectionHead align="center" eyebrow="What we treat" title={`${SPECIALITIES.length} specialities we cover`} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SPECIALITIES.map((s) => (
                <a key={s.slug} href={`/specialities/${s.slug}`} className="rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-md">
                  <h3 className="text-sm font-bold text-navy">{s.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.tagline}</p>
                </a>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead align="center" eyebrow="What guides us" title="Our values" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-border bg-background p-5">
                  <CheckCircle2 className="h-7 w-7 text-brand-orange" />
                  <h3 className="mt-3 text-base font-bold text-navy">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container>
            <SectionHead eyebrow="Coverage" title="Where we help patients" />
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <a key={c.slug} href={`/locations/${c.slug}`} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-navy hover:border-primary/40">
                  {c.name}
                </a>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-navy py-14">
          <Container className="max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-navy-foreground sm:text-3xl">Ready to take the first step?</h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              {promiseEnabled("free-consult") ? "Your first consultation is free. " : ""}{cap(CALLER)} will call you back {CALLBACK_PHRASE}.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href="/contact"><OrangeButton>{BOOK_LABEL}</OrangeButton></a>
              <a href="/treatments"><OutlineButton tone="light">Browse Treatments</OutlineButton></a>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
