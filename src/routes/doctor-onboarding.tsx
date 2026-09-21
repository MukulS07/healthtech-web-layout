import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { SITE, telHref, whatsappHref } from "@/lib/site";
import { seo } from "@/lib/seo";

const partnerBenefits = [
  {
    title: "Steady patient flow",
    desc: "Pre-screened patients matched to your speciality, so consultations convert into procedures you're actually equipped and interested in performing.",
  },
  {
    title: "Admin taken off your plate",
    desc: "We handle insurance pre-authorisation, hospital slot booking, and patient scheduling and reminders, so your time goes to patients, not paperwork.",
  },
  {
    title: "Payments and EMI",
    desc: "We manage patient financing options directly with the patient and settle your payments on a fortnightly cycle, with a statement for every case.",
  },
  {
    title: "Clear commercial terms",
    desc: "Your commercial model — commission per case or a flat empanelment fee — is confirmed with you in writing before you take your first patient.",
  },
];

const eligibility = [
  "Valid MBBS with a relevant postgraduate qualification (MS / MCh / DNB or equivalent) in an eligible speciality",
  "Active, current registration with your State Medical Council or the National Medical Commission — registration number required at application",
  "Minimum 3 years of independent surgical practice after postgraduate qualification",
  "Willingness to operate at one or more Go Surgery partner hospitals in your city",
  "No active disciplinary action with any medical council or hospital",
];

const onboardingSteps = [
  {
    title: "Register your interest",
    desc: "Submit the form below with your qualifications, registration number, and preferred city.",
  },
  {
    title: "Document verification",
    desc: "Our credentialing team verifies your degree, registration, and experience directly with the issuing bodies — typically completed within 3–5 business days.",
  },
  {
    title: "Empanelment call",
    desc: "A short call to confirm your speciality focus, procedure volumes, preferred hospitals, and weekly availability.",
  },
  {
    title: "Hospital mapping",
    desc: "We match you to partner hospital(s) with available OT slots and equipment suited to your speciality.",
  },
  {
    title: "Go live",
    desc: "Start receiving matched patient consultations through the Go Surgery team once your profile is approved.",
  },
];

const doctorFaqs = [
  {
    q: "How many patients can I expect?",
    a: "This varies by speciality, city, and your own availability — most partner doctors see case volume build steadily over the first 60–90 days as their slot list develops a track record.",
  },
  {
    q: "Do I need to leave my current practice?",
    a: "No. Most partner doctors continue their existing practice and take Go Surgery patients alongside it, on the days and hours they choose.",
  },
  {
    q: "Which hospitals will I operate at?",
    a: "We map you to partner hospitals in your city with OT capacity and equipment for your speciality — you're not required to bring your own hospital relationship.",
  },
];

export const Route = createFileRoute("/doctor-onboarding")({
  head: ({ match }) =>
    seo({
      locale: match.context.locale,
      title: "Doctor Onboarding",
      description: "Partner with Go Surgery — bring your practice a steady, qualified patient pipeline without taking on the admin, insurance chasing, or marketing yourself.",
      path: "/doctor-onboarding",
    }),
  component: DoctorOnboardingPage,
});

function DoctorForm() {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [qualification, setQualification] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty || !registrationNumber || !phone) {
      toast.error("Please fill in your name, speciality, registration number, and phone number.");
      return;
    }
    setIsSubmitting(true);
    // Not wired to a credentialing pipeline yet — route this to the doctor-onboarding team before launch.
    setTimeout(() => {
      toast.success("Application received. Our credentialing team will reach out within 3-5 business days.");
      setName("");
      setSpecialty("");
      setQualification("");
      setRegistrationNumber("");
      setExperience("");
      setCity("");
      setPhone("");
      setEmail("");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Full Name *</label>
          <input
            className={inputClass}
            placeholder="Dr. full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Speciality *</label>
          <input
            className={inputClass}
            placeholder="e.g. ENT, Urology, Gynaecology"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">
            Highest Qualification
          </label>
          <input
            className={inputClass}
            placeholder="MBBS, MS, MCh, DNB, etc."
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">
            Medical Registration Number *
          </label>
          <input
            className={inputClass}
            placeholder="Registration number and issuing council"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">
            Years of Independent Practice
          </label>
          <input
            type="number"
            className={inputClass}
            placeholder="e.g. 5"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">City</label>
          <input
            className={inputClass}
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Phone *</label>
          <input
            className={inputClass}
            placeholder="Phone number"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Email</label>
          <input
            type="email"
            className={inputClass}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <OrangeButton type="submit" disabled={isSubmitting} className="w-full py-3 text-base sm:w-auto">
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
          </span>
        ) : (
          "Submit Application"
        )}
      </OrangeButton>
    </form>
  );
}

function DoctorOnboardingPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">For doctors and surgeons</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Partner with Go Surgery.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Bring your practice a steady, qualified patient pipeline without taking on the
              admin, insurance chasing, or marketing yourself.
            </p>
            <a href="#doctor-form" className="mt-6 inline-block">
              <OrangeButton>Register as a Partner Doctor</OrangeButton>
            </a>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead eyebrow="What you get" title="What partner doctors get" />
            <div className="grid gap-5 sm:grid-cols-2">
              {partnerBenefits.map((b) => (
                <div key={b.title} className="rounded-xl border border-border bg-background p-5">
                  <h3 className="text-base font-bold text-navy">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Eligibility" title="Who can apply" />
            <ul className="space-y-0">
              {eligibility.map((e) => (
                <li key={e} className="flex items-start gap-3 border-t border-border py-3.5 text-sm text-ink/80 last:border-b">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="What to expect" title="Onboarding process" />
            <div className="space-y-0">
              {onboardingSteps.map((s, i, arr) => (
                <div key={s.title} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                      {i + 1}
                    </div>
                    {i < arr.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
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

        <section className="bg-cream py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Good to know" title="Questions doctors usually ask" />
            <div className="space-y-3">
              {doctorFaqs.map((f) => (
                <div key={f.q} className="rounded-xl border border-border bg-background p-5">
                  <h4 className="text-sm font-bold text-navy">{f.q}</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-14" id="doctor-form">
          <Container className="max-w-2xl">
            <SectionHead eyebrow="Get started" title="Register as a partner doctor" />
            <DoctorForm />
          </Container>
        </section>

        <section className="bg-navy py-14 text-center text-navy-foreground">
          <Container>
            <Eyebrow tone="light">Questions about partnering?</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">We're happy to talk it through</h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              Write to doctors@gosurgery.in or call {SITE.phone.display}.
            </p>
            <a href="mailto:doctors@gosurgery.in" className="mt-6 inline-block">
              <OrangeButton>Email the Onboarding Team</OrangeButton>
            </a>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
