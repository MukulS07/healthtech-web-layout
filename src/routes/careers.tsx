import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Users, Stethoscope, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { A } from "@/components/common/A";
import { seo } from "@/lib/seo";

const whyWorkHere = [
  {
    icon: Sparkles,
    title: "Real impact",
    desc: "Every call, ticket or line of code shortens someone's path to getting treated properly.",
  },
  {
    icon: Users,
    title: "Ownership early",
    desc: "Small teams, direct access to leadership, and real room to run your own area from day one.",
  },
  {
    icon: Stethoscope,
    title: "Healthcare depth",
    desc: "Work alongside practising surgeons and hospital operations teams, not just a product spec.",
  },
];

const openRoles = [
  {
    title: "ENT Surgeon (Consultant)",
    meta: "Clinical · Bangalore · Full-time",
    desc: "Run outpatient consultations and elective day-care ENT surgeries for patients referred through the network, and work with the Care Partner team on case scheduling and post-op follow-up.",
    reqs: [
      "MS/DNB in ENT with a valid, current state medical council registration",
      "Minimum 3 years of post-qualification surgical experience",
      "Comfortable operating across more than one partner hospital in the city",
    ],
  },
  {
    title: "Patient Care Coordinator",
    meta: "Patient Experience · Delhi NCR · Full-time",
    desc: "Own the end-to-end journey for a caseload of patients: insurance pre-authorisation, hospital admission, discharge coordination, and post-surgery follow-up calls.",
    reqs: [
      "Graduate degree in any discipline",
      "Fluent in Hindi and English; comfortable on the phone for most of the day",
      "Prior experience in healthcare, hospitality, or customer coordination preferred",
    ],
  },
  {
    title: "Insurance & TPA Executive",
    meta: "Finance & Insurance · Mumbai · Full-time",
    desc: "Process cashless pre-authorisation requests with insurers and third-party administrators, track claim status end to end, and resolve rejected or delayed claims.",
    reqs: [
      "1–3 years of experience in health insurance claims or TPA operations",
      "Working knowledge of cashless claim workflows",
      "High attention to detail under deadline pressure",
    ],
  },
  {
    title: "Backend Engineer (Node.js)",
    meta: "Technology · Bangalore (Hybrid) · Full-time",
    desc: "Build and maintain the scheduling and patient-record systems used daily by Care Partners and partner hospitals.",
    reqs: [
      "2+ years working with Node.js and relational databases",
      "Experience designing APIs used by internal, non-technical teams",
      "Healthcare-domain experience is a plus, not a requirement",
    ],
  },
  {
    title: "Growth Marketing Associate",
    meta: "Marketing · Delhi NCR · Full-time",
    desc: "Run performance marketing campaigns aimed at patients researching elective procedures, and report on cost per qualified consultation.",
    reqs: [
      "1–2 years of performance marketing experience",
      "Comfortable with analytics and campaign-reporting tools",
      "Healthcare or D2C marketing background preferred",
    ],
  },
  {
    title: "City Operations Manager",
    meta: "Operations · Multiple cities · Full-time",
    desc: "Own hospital-partner relationships and OT-slot availability in an assigned city, and resolve day-of-surgery logistics issues as they come up.",
    reqs: [
      "3+ years in healthcare or hospital operations",
      "Comfortable negotiating with hospital administration",
      "Willing to be on-call for urgent day-of-surgery issues",
    ],
  },
];

const departments = [
  "Clinical Operations",
  "Technology & Product",
  "Patient Care",
  "Insurance & Finance",
  "Marketing",
  "People & Talent",
];

const benefits = [
  "Group health insurance covering the employee and immediate family",
  "24 paid leave days a year, in addition to public holidays",
  "Annual health check-up for all employees",
  "Learning and certification cost reimbursement, capped annually",
  "Hybrid work options for non-clinical roles",
  "Parental leave in line with statutory requirements",
];

const hiringSteps = [
  {
    title: "Application review",
    desc: "We review every application against the role's requirements, usually within 5 working days.",
  },
  {
    title: "Screening call",
    desc: "A 20–30 minute call with the hiring team to walk through your background and the role.",
  },
  {
    title: "Role-specific round",
    desc: "A case discussion, technical exercise, or clinical interview, depending on the role.",
  },
  {
    title: "Final conversation",
    desc: "A conversation with the function lead or founder, followed by an offer.",
  },
];

export const Route = createFileRoute("/careers")({
  head: ({ match }) =>
    seo({
      locale: match.context.locale,
      title: "Careers",
      description: "Join the team building Go Surgery — open roles across clinical operations, patient care, technology and growth.",
      path: "/careers",
    }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Careers at Go Surgery</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Help fix how India gets planned surgery.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              We're building the team across clinical operations, patient care, technology and
              growth.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead align="center" eyebrow="Why work here" title="Built for people who want to own something" />
            <div className="grid gap-5 sm:grid-cols-3">
              {whyWorkHere.map((w) => (
                <div key={w.title} className="rounded-xl border border-border bg-background p-5">
                  <w.icon className="h-7 w-7 text-brand-orange" />
                  <h3 className="mt-3 text-base font-bold text-navy">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container>
            <SectionHead eyebrow="Open roles" title="Current openings" />
            <div className="space-y-4">
              {openRoles.map((role) => (
                <article
                  key={role.title}
                  className="rounded-xl border border-border bg-background p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-navy">{role.title}</h3>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{role.meta}</p>
                    </div>
                    <A href={`mailto:careers@gosurgery.in?subject=Application: ${role.title}`}>
                      <OrangeButton className="px-4 py-2 text-xs">Apply</OrangeButton>
                    </A>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{role.desc}</p>
                  <ul className="mt-3 space-y-1.5">
                    {role.reqs.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-xs text-ink/80">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead align="center" eyebrow="Always hiring" title="Departments hiring across the year" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((d) => (
                <div
                  key={d}
                  className="rounded-xl border border-border bg-background p-5 text-center"
                >
                  <h3 className="text-sm font-bold text-navy">{d}</h3>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Benefits" title="What you get" />
            <ul className="space-y-0">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 border-t border-border py-3.5 text-sm text-ink/80 last:border-b"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="What to expect" title="Our hiring process" />
            <div className="space-y-0">
              {hiringSteps.map((s, i) => (
                <div key={s.title} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                      {i + 1}
                    </div>
                    {i < hiringSteps.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-base font-bold text-navy">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-navy py-14">
          <Container className="max-w-2xl text-center">
            <Eyebrow tone="light">How to apply</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-navy-foreground sm:text-3xl">
              Don't see the right role listed?
            </h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              Send your resume to careers@gosurgery.in with the role or area you're interested in.
              We aim to acknowledge every application within 5 working days.
            </p>
            <A href="mailto:careers@gosurgery.in" className="mt-6 inline-block">
              <OrangeButton>Email Your Resume</OrangeButton>
            </A>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
