import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import heroDoctor from "@/assets/hero-doctor.png";

const stats = [
  { value: "2M+", label: "Patients Treated" },
  { value: "800+", label: "Partner Hospitals" },
  { value: "45+", label: "Cities" },
  { value: "400+", label: "Expert Surgeons" },
];

const values = [
  { title: "Patient First", desc: "Every decision — from how we staff our care coordination team to which hospitals we partner with — starts with what is best for the patient." },
  { title: "Transparency", desc: "We publish cost ranges, success rates and surgeon credentials openly, so patients can make informed decisions without pressure." },
  { title: "Clinical Excellence", desc: "Our surgeon network undergoes continuous peer review. We partner only with NABH-accredited facilities that meet our safety standards." },
  { title: "Whole-Journey Support", desc: "From the first call to the final follow-up, a dedicated care coordinator stays with every patient. We don't disappear after discharge." },
];

const milestones = [
  { year: "2014", event: "Founded in Hyderabad with 3 partner hospitals and 12 surgeons." },
  { year: "2016", event: "Expanded to Delhi NCR and Mumbai. Introduced cashless insurance desk." },
  { year: "2018", event: "Crossed 1 lakh patients. Opened dedicated post-op care coordination centre." },
  { year: "2020", event: "Launched telehealth consultations during the pandemic. Reached 25 cities." },
  { year: "2022", event: "Crossed 10 lakh patients. Introduced robotic surgery partnerships." },
  { year: "2024", event: "Expanded to 45+ cities. Partnered with 100+ insurance providers." },
  { year: "2026", event: "2M+ lives touched. Continuing expansion across Tier 2 cities." },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Prime Care | Thoughtful Health Support" },
      { name: "description", content: "Prime Care connects patients with trusted specialists, modern hospitals and dedicated care teams across 45+ cities in India." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-navy py-16">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow tone="light">Our story</Eyebrow>
              <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl lg:text-5xl">
                Thoughtful care for every step of your health journey
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-navy-foreground/75 sm:text-base">
                Prime Care is a connected health network that brings patients, specialist surgeons, accredited hospitals and insurance partners together across 45+ cities. We simplify the parts of care that often feel stressful — finding the right doctor, understanding your options, managing paperwork and supporting recovery.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <OrangeButton>Book Free Consultation</OrangeButton>
                <OutlineButton tone="light">Meet Our Doctors</OutlineButton>
              </div>
            </div>
            <img src={heroDoctor} alt="Care team" loading="lazy" width={1000} height={900} className="w-full max-w-md justify-self-center object-contain" />
          </Container>
        </section>

        {/* Stats */}
        <section className="bg-cream py-12">
          <Container className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-brand-orange sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </Container>
        </section>

        {/* Mission */}
        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead align="center" eyebrow="Our mission" title="Why We Exist" />
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                In India, a patient seeking elective surgery faces a fragmented experience: finding a trustworthy specialist in the right city, understanding whether the procedure is actually necessary, navigating insurance pre-authorisation, arranging transport, managing post-operative care — each step handled by a different person, or no one at all.
              </p>
              <p>
                Prime Care was built to solve this. We coordinate everything — from the first conversation about symptoms to the final follow-up consultation — through a dedicated care team that stays with each patient through the whole journey.
              </p>
              <p>
                Our clinical team partners only with surgeons and hospitals that meet our safety and quality standards. Our insurance desk has pre-authorisation relationships with 100+ insurers. And our care coordinators are available 24x7 — not just during business hours.
              </p>
            </div>
          </Container>
        </section>

        {/* Values */}
        <section className="bg-cream py-14">
          <Container>
            <SectionHead align="center" eyebrow="What guides us" title="Our Values" />
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

        {/* Timeline */}
        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Our journey" title="How We Got Here" />
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                      {m.year.slice(-2)}
                    </div>
                    {i < milestones.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-8">
                    <p className="text-xs font-semibold text-brand-orange">{m.year}</p>
                    <p className="mt-1 text-sm text-ink/80">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="bg-navy py-14">
          <Container className="max-w-2xl text-center">
            <Eyebrow tone="light">Join 2M+ patients</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-navy-foreground sm:text-3xl">Ready to take the first step?</h2>
            <p className="mt-3 text-sm text-navy-foreground/75">Your first consultation is free. A care coordinator will call you within 30 minutes.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <OrangeButton>Book Free Consultation</OrangeButton>
              <OutlineButton tone="light">Browse Treatments</OutlineButton>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
