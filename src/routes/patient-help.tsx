import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, MessageCircle, Mail, ChevronDown, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { SITE, telHref, whatsappHref } from "@/lib/site";

const talkToUs = [
  { icon: Phone, label: "Helpline", value: SITE.phone.display, href: telHref },
  {
    icon: MessageCircle,
    label: "WhatsApp support",
    value: SITE.whatsapp.display,
    href: whatsappHref(),
  },
  { icon: Mail, label: "Email", value: "support@gosurgery.in", href: "mailto:support@gosurgery.in" },
];

const helpWith = [
  "Book or reschedule a consultation",
  "Track the status of an upcoming surgery",
  "Understand insurance approval or EMI options",
  "Get post-surgery care instructions or arrange a follow-up call",
  "Raise a complaint or give feedback on your experience",
];

const whatToBring = [
  "A government-issued photo ID",
  "Your insurance policy card and policy number, if applicable",
  "Any previous test reports, scans, or prescriptions related to your condition",
  "A list of medicines you're currently taking",
];

const faqs = [
  {
    q: "Do I need a referral to book a consultation?",
    a: "No — you can book directly through the website or helpline. A doctor reviews your symptoms or reports on the first call.",
  },
  {
    q: "Is the first consultation really free?",
    a: "Yes. If a specialist consultation beyond the first review is needed, it's billed at the hospital's standard rate, which your Care Partner will confirm upfront.",
  },
  {
    q: "Will my insurance cover the procedure?",
    a: "Your Care Partner checks your policy and applies for cashless pre-authorisation where possible, and gives you a clear written estimate of what's covered and what isn't before you confirm surgery.",
  },
  {
    q: "Can I choose my hospital?",
    a: "Where more than one partner hospital offers your procedure in your city, you can choose based on location, cost, or surgeon availability.",
  },
  {
    q: "What if I need to cancel or reschedule?",
    a: "Contact your Care Partner or the helpline as early as possible, ideally at least 48 hours before your scheduled time.",
  },
  {
    q: "How is my payment protected?",
    a: "Every cost is confirmed with you in writing before you pay anything, and refunds for cancelled procedures are processed back to the original payment method.",
  },
];

const patientRights = [
  "The right to a clear explanation of your diagnosis, procedure, and alternatives before consenting to surgery",
  "The right to a written cost estimate before treatment begins",
  "The right to seek a second opinion at any point",
  "The right to access and control how your medical data is shared",
];

export const Route = createFileRoute("/patient-help")({
  head: () => ({
    meta: [
      { title: "Patient Help | Go Surgery" },
      {
        name: "description",
        content:
          "Reach your Care Partner, check on an upcoming procedure, or find answers to common patient questions.",
      },
    ],
  }),
  component: PatientHelpPage,
});

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-background">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-navy">{f.q}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-brand-orange transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ComplaintForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [issue, setIssue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !issue) {
      toast.error("Please fill in your name, phone number, and a description of the issue.");
      return;
    }
    setIsSubmitting(true);
    // Not wired to a ticketing system yet — route this to patient-experience before launch.
    setTimeout(() => {
      toast.success("Complaint received. Our patient-experience team will contact you shortly.");
      setName("");
      setPhone("");
      setBookingId("");
      setIssue("");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Full Name *</label>
          <input
            className={inputClass}
            placeholder="Patient name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">
            Registered Phone Number *
          </label>
          <input
            className={inputClass}
            placeholder="Phone number on file"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-navy">
          Booking / Patient ID (if any)
        </label>
        <input
          className={inputClass}
          placeholder="Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-navy">Describe the issue *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={4}
          placeholder="What happened, and when?"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          required
        />
      </div>
      <OrangeButton type="submit" disabled={isSubmitting} className="w-full py-3 text-base sm:w-auto">
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
          </span>
        ) : (
          "Submit Complaint"
        )}
      </OrangeButton>
    </form>
  );
}

function PatientHelpPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Patient support</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              How can we help?
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Reach your Care Partner, check on an upcoming procedure, or find answers below.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead eyebrow="Talk to someone now" title="Get in touch directly" />
            <div className="grid gap-4 sm:grid-cols-3">
              {talkToUs.map((t) => (
                <a
                  key={t.label}
                  href={t.href}
                  className="rounded-xl border border-border bg-background p-5 transition-colors hover:border-navy/20"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-navy">
                    <t.icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-navy">{t.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.value}</p>
                </a>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-cream p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
              <p className="text-sm text-ink/80">
                If this is a medical emergency, call <strong>112</strong> or go to your nearest
                emergency room. The Go Surgery helpline supports planned-surgery patients and is
                not an emergency service.
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHead eyebrow="Support" title="What we can help with" />
              <ul className="space-y-0">
                {helpWith.map((h) => (
                  <li
                    key={h}
                    className="border-t border-border py-3.5 text-sm text-ink/80 last:border-b"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHead eyebrow="Before your visit" title="What to bring to your first hospital visit" />
              <ul className="space-y-0">
                {whatToBring.map((w) => (
                  <li
                    key={w}
                    className="border-t border-border py-3.5 text-sm text-ink/80 last:border-b"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Recovery" title="Before and after your surgery" />
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Your surgeon's team shares specific pre-operative instructions — such as fasting
              timing and which regular medicines to pause — a few days before your procedure, and
              these can vary by patient and procedure type. Your Care Partner will confirm these
              with you directly rather than following generic instructions, and will schedule your
              post-operative follow-up calls before you're discharged.
            </p>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Good to know" title="Frequently asked questions" />
            <FaqAccordion />
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <SectionHead eyebrow="Know your rights" title="Patient rights" />
            <ul className="space-y-0">
              {patientRights.map((r) => (
                <li
                  key={r}
                  className="border-t border-border py-3.5 text-sm text-ink/80 last:border-b"
                >
                  {r}
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container>
            <SectionHead eyebrow="Payment options" title="Insurance and financing partners" />
            <div className="flex flex-wrap gap-2">
              {[
                "Star Health",
                "HDFC Ergo",
                "Care Health",
                "Bajaj Allianz",
                "ICICI Lombard",
                "TATA AIG",
                "Aditya Birla Health",
                "New India Assurance",
              ].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-navy"
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No-cost EMI is also available through partner banks, typically over 3–12 months.
            </p>
          </Container>
        </section>

        <section className="bg-navy py-14 text-navy-foreground">
          <Container>
            <Eyebrow tone="light">Raise a complaint</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Something not go as expected?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75">
              Tell us what happened and our patient-experience team will follow up directly.
            </p>
            <div className="mt-8 rounded-xl bg-background p-6 text-ink">
              <ComplaintForm />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
