import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Lock,
  Loader2,
  UserRound,
  LogOut,
  Landmark,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { submitConsultationFn } from "@/lib/server-functions/consultations";

const treatments = [
  "Piles / Fissure",
  "Hernia",
  "Kidney Stone",
  "Gallstone",
  "Cataract",
  "Knee Replacement",
  "Gynaecology",
  "ENT",
  "Urology",
  "Orthopedics",
  "Aesthetics",
  "Other",
];
const cities = [
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
  "Indore",
  "Other",
];

const teamEmails = [
  { label: "Media & press", email: "press@gosurgery.in" },
  { label: "Partnerships", email: "partnerships@gosurgery.in" },
  { label: "Doctor onboarding", email: "doctors@gosurgery.in" },
  { label: "Careers", email: "careers@gosurgery.in" },
  { label: "Insurance & billing", email: "insurance@gosurgery.in" },
  { label: "Grievance officer", email: "grievance@gosurgery.in" },
];

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "X / Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const infoCards = [
  {
    icon: Phone,
    label: "Call us",
    value: "1800 000 1234",
    note: "Mon – Sat, 8 AM – 9 PM",
    href: "tel:18000001234",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "care@gosurgery.in",
    note: "We reply within 4 hours",
    href: "mailto:care@gosurgery.in",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 98765 43210",
    note: "Fastest response",
    href: "https://wa.me/919876543210",
  },
  {
    icon: MapPin,
    label: "Head office",
    value: "Go Surgery HQ, Sector 18, Gurugram – 122015",
    note: "By appointment only",
  },
  { icon: Clock, label: "Consultation hours", value: "8 AM – 9 PM", note: "Monday to Saturday" },
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book Free Consultation | Go Surgery" },
      {
        name: "description",
        content:
          "Book your free consultation with a specialist. We'll match you with the right doctor in under 30 minutes.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [treatment, setTreatment] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading, logout } = useCurrentUser();
  const queryClient = useQueryClient();

  // Prefill contact details from the account once the patient logs in.
  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name);
    setPhone((v) => v || user.phone);
    setEmail((v) => v || user.email);
  }, [user]);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !treatment || !city) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitConsultationFn({
        data: {
          name,
          phone,
          email,
          treatment,
          city,
          message,
        },
      });

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
        toast.success("Consultation booked! Track its status in My Appointments.", {
          action: { label: "View", onClick: () => (window.location.href = "/account") },
        });
        setTreatment("");
        setCity("");
        setMessage("");
      } else {
        toast.error(res.error || "Failed to submit consultation request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Database connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Free consultation</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Book Your Consultation
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Share your details and we'll match you with the right specialist in under 30 minutes.
              Zero waiting, zero jargon.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Full form */}
            <div>
              <SectionHead eyebrow="Get in touch" title="Tell us how we can help" />

              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !user ? (
                // Booking requires an account so every appointment can be saved and tracked later.
                <div className="max-w-md">
                  <p className="mb-4 text-sm text-ink">
                    <span className="font-semibold text-navy">Log in or create a free account</span>{" "}
                    to book — this is how we save your appointment and let you check its status
                    anytime.
                  </p>
                  <AuthPanel />
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-cream px-4 py-3">
                    <p className="flex items-center gap-2 text-sm text-ink">
                      <UserRound className="h-4 w-4 text-brand-orange" />
                      Booking as <span className="font-semibold text-navy">{user.name}</span>
                    </p>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                      <a href="/account" className="text-navy hover:text-brand-orange">
                        My Appointments
                      </a>
                      <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-navy"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Log out
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-navy">
                          Full Name *
                        </label>
                        <input
                          className={inputClass}
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-navy">
                          Phone Number *
                        </label>
                        <input
                          className={inputClass}
                          placeholder="+91 98765 43210"
                          inputMode="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-navy">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-navy">
                          Treatment / Concern *
                        </label>
                        <select
                          className={inputClass}
                          value={treatment}
                          onChange={(e) => setTreatment(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select treatment
                          </option>
                          {treatments.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-navy">
                          Your City *
                        </label>
                        <select
                          className={inputClass}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select city
                          </option>
                          {cities.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-navy">
                        Additional details (optional)
                      </label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        rows={4}
                        placeholder="Describe your symptoms, how long you've had them, or any questions…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <OrangeButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 text-base"
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending your request...
                        </span>
                      ) : (
                        "Request Free Consultation"
                      )}
                    </OrangeButton>
                    <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                      <Lock className="h-3 w-3" /> Your data is encrypted and handled with strict
                      medical privacy.
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-5">
              <div>
                <Eyebrow>Other ways to reach us</Eyebrow>
                <h2 className="mt-2 text-xl font-bold text-navy">Contact Information</h2>
              </div>
              {infoCards.map((card) => (
                <div
                  key={card.label}
                  className="flex gap-4 rounded-xl border border-border bg-cream p-4"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy">
                    <card.icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {card.label}
                    </p>
                    {card.href ? (
                      <a
                        href={card.href}
                        className="mt-0.5 text-sm font-semibold text-navy hover:text-brand-orange"
                      >
                        {card.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-navy">{card.value}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{card.note}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-navy p-5 text-navy-foreground">
                <p className="text-sm font-bold">Emergency or urgent care?</p>
                <p className="mt-1 text-xs text-navy-foreground/75">
                  Call our 24/7 helpline directly. A medical coordinator will assist you
                  immediately.
                </p>
                <a
                  href="tel:18000001234"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Phone className="h-4 w-4" /> 1800 000 1234
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHead eyebrow="Specific teams" title="Reach the right team directly" />
              <ul className="space-y-0">
                {teamEmails.map((t) => (
                  <li
                    key={t.label}
                    className="flex items-center justify-between border-t border-border py-3.5 text-sm last:border-b"
                  >
                    <span className="font-semibold text-navy">{t.label}</span>
                    <a href={`mailto:${t.email}`} className="text-muted-foreground hover:text-brand-orange">
                      {t.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHead eyebrow="Corporate" title="Registered office" />
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-5">
                <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
                <div className="text-sm text-ink/80">
                  <p className="font-semibold text-navy">Go Surgery Health Pvt. Ltd.</p>
                  <p className="mt-1">Sector 18, Gurugram – 122015, Haryana, India</p>
                </div>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Follow us
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-navy transition-colors hover:border-navy/20 hover:text-brand-orange"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
