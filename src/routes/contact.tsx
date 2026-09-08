import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Lock } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { toast } from "sonner";

const treatments = ["Piles / Fissure", "Hernia", "Kidney Stone", "Gallstone", "Cataract", "Knee Replacement", "Gynaecology", "ENT", "Urology", "Orthopedics", "Aesthetics", "Other"];
const cities = ["Delhi NCR", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Kochi", "Indore", "Other"];

const infoCards = [
  { icon: Phone, label: "Call us", value: "1800 000 1234", note: "Mon – Sat, 8 AM – 9 PM", href: "tel:18000001234" },
  { icon: Mail, label: "Email us", value: "care@primecare.in", note: "We reply within 4 hours", href: "mailto:care@primecare.in" },
  { icon: MapPin, label: "Head office", value: "Prime Care HQ, Sector 18, Gurugram – 122015", note: "By appointment only" },
  { icon: Clock, label: "Consultation hours", value: "8 AM – 9 PM", note: "Monday to Saturday" },
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book Free Consultation | Prime Care" },
      { name: "description", content: "Book your free consultation with a specialist. We'll match you with the right doctor in under 30 minutes." },
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

  const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Request received! Our care coordinator will call you within 30 minutes.");
    setName(""); setPhone(""); setEmail(""); setTreatment(""); setCity(""); setMessage("");
  };

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Free consultation</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Book Your Consultation</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Share your details and we'll match you with the right specialist in under 30 minutes. Zero waiting, zero jargon.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Full form */}
            <div>
              <SectionHead eyebrow="Get in touch" title="Tell us how we can help" />
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-navy">Full Name *</label>
                    <input className={inputClass} placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-navy">Phone Number *</label>
                    <input className={inputClass} placeholder="+91 98765 43210" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy">Email Address</label>
                  <input type="email" className={inputClass} placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-navy">Treatment / Concern *</label>
                    <select className={inputClass} value={treatment} onChange={(e) => setTreatment(e.target.value)} required>
                      <option value="" disabled>Select treatment</option>
                      {treatments.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-navy">Your City *</label>
                    <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required>
                      <option value="" disabled>Select city</option>
                      {cities.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy">Additional details (optional)</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={4}
                    placeholder="Describe your symptoms, how long you've had them, or any questions…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <OrangeButton type="submit" className="w-full py-3 text-base">
                  Request Free Consultation
                </OrangeButton>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" /> Your data is secured. We never share your information.
                </p>
              </form>
            </div>

            {/* Contact info */}
            <div className="space-y-5">
              <div>
                <Eyebrow>Other ways to reach us</Eyebrow>
                <h2 className="mt-2 text-xl font-bold text-navy">Contact Information</h2>
              </div>
              {infoCards.map((card) => (
                <div key={card.label} className="flex gap-4 rounded-xl border border-border bg-cream p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy">
                    <card.icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{card.label}</p>
                    {card.href ? (
                      <a href={card.href} className="mt-0.5 text-sm font-semibold text-navy hover:text-brand-orange">{card.value}</a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-navy">{card.value}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{card.note}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-navy p-5 text-navy-foreground">
                <p className="text-sm font-bold">Emergency or urgent care?</p>
                <p className="mt-1 text-xs text-navy-foreground/75">Call our 24/7 helpline directly. A medical coordinator will assist you immediately.</p>
                <a href="tel:18000001234" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white">
                  <Phone className="h-4 w-4" /> 1800 000 1234
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
